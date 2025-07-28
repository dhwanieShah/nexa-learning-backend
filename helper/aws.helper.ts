import { PutObjectCommand, S3Client, DeleteObjectCommand, ObjectCannedACL, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { extname } = require('path');
// import { LoggerService } from 'src/logger/logger.service';
const fs = require('fs');

@Injectable()
export class UploadFile {
  private readonly s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  async uploadFile(fileName: string, file: Buffer, contentType: string, dir: string) {
    const key = `${dir}/${Date.now()}${extname(fileName)}`;
    const params = {
      ACL: 'public-read' as ObjectCannedACL,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new HttpException(
        {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'Error uploading image!',
          error: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async deleteImageFromS3(imageKey: string): Promise<void> {
    console.log('deleteImageFromS3  imageKey', imageKey);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageKey,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
      console.log('Image deleted successfully from S3');
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      throw error;
    }
  }

  async getListingS3(prefix: string): Promise<string[]> {
    console.log('getListingS3 prefix', prefix);
    try {
      // const params = {
      //   Bucket: process.env.S3_BUCKET_NAME,
      //   MaxKeys: 1000,
      //   Prefix: prefix,
      // };

      const allKeys = [];

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        MaxKeys: 1000,
        Prefix: prefix,
      };

      const listAllKeys = async (params) => {
        const command = new ListObjectsV2Command(params);
        console.log('UploadFile  listAllKeys  command', command);
        const data = await this.s3Client.send(command);
        console.log('data ========>', data);
        const contents = data.Contents || [];
        console.log('UploadFile  listAllKeys  contents', contents);
        contents.forEach((content) => {
          allKeys.push(content.Key);
        });

        if (data.IsTruncated) {
          params.ContinuationToken = data.NextContinuationToken;
          console.log('get further list...');
          await listAllKeys(params);
        }
      };
      console.log('UploadFile  listAllKeys  listAllKeys', listAllKeys);

      await listAllKeys(params);

      console.log('UploadFile  getListingS3  allKeys', allKeys);
      return allKeys;
    } catch (error) {
      console.log('Error in getListingS3:', error);
      throw new HttpException(
        {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error fetching S3 listing',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getVideoListingS3(prefix: string): Promise<string[]> {
    console.log('getListingS3 prefix', prefix);
    try {
      const allFiles = [];

      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        MaxKeys: 1000,
        Prefix: prefix,
      };

      const listAllKeys = async (params) => {
        const command = new ListObjectsV2Command(params);
        const data = await this.s3Client.send(command);
        const contents = data.Contents || [];

        contents.forEach((content) => {
          if (!content.Key.endsWith('/')) {
            allFiles.push({ key: content.Key, size: content.Size });
          }
        });

        if (data.IsTruncated) {
          params.ContinuationToken = data.NextContinuationToken;
          await listAllKeys(params);
        }
      };

      await listAllKeys(params);
      return allFiles;
    } catch (error) {
      console.error('Error in getListingS3:', error);
      throw new HttpException(
        {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error fetching S3 listing',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
