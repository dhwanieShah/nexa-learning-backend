import { Response } from 'express';
import { en } from '../helper/resources/en_messages';
import { fr } from '../helper/resources/fr_messages';
import { LANGUAGE_CODE } from 'src/utils/constants';

const getMessage = (
  languageCode: string,
  code: string,
  defaultcode: string,
) => {
  // console.log('languageCode====>', languageCode);
  // console.log('code====>', code);

  if (languageCode === 'fr') {
    return fr[code] ? fr[code] : fr[defaultcode];
  } else {
    return en[code] ? en[code] : en[defaultcode];
  }
};

export const error = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,
  message: string,
  statusCode = 400,
  data: any = {},
) => {
  const resData = {
    status: false,
    message: getMessage(languageCode, message, 'DEFAULT'),
    data,
  };
  console.log('resData', resData);
  return res.status(statusCode).json(resData);
};

export const success = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,
  message: string,
  statusCode = 200,
  // res: Response,
  // code: string = '',
  data: any = {},
) => {
  const resData = {
    status: true,
    message: getMessage(languageCode, message, 'DEFAULT'),
    data,
  };
  console.log('resData', resData);
  return res.status(statusCode).json(resData);
};

export const customSuccess = (res: Response, response: any) => {
  return res.status(200).json(response);
};

export const customResponse = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,
  message: string,
  statusCode = 200,
  data: any = {},

  // res: Response,
  // code: string = '',
) => {
  const resData = {
    status: true,
    message: getMessage(languageCode, message, 'DEFAULT'),
    statusCode: statusCode,
    data,
    // messageCode: code,
    // data,
  };
  return res.status(statusCode).json(resData);
};

/*
 *  Pagination Response
 */

export const paginationResponse = (
  languageCode: string = LANGUAGE_CODE.EN,
  // languageCode = 'en',
  res,
  // code = '',
  message: string,
  statusCode = 200,
  data: any = [],
) => {
  data.data = data.list;
  delete data.list;
  const resData = {
    status: true,
    message: getMessage(languageCode, message, 'DEFAULT'),
    // statusCode: statusCode,
    // messageCode: code,
    ...data,
  };
  console.log('resData', resData);
  return res.status(statusCode).json(resData);
};

export const CustomError = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,

  // res: Response,
  code: string = '',
  statusCode: number = 400,
  data: any = {},
  message: string,
) => {
  const resData = {
    status: false,
    message: getMessage(languageCode, message, 'DEFAULT'),
    data: data,
  };
  return res.status(statusCode).json(resData);
};

export const notFound = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,

  // res: Response,
  code: string,
  statusCode: number = 404,
) => {
  const resData = {
    status: false,
    message:
      getMessage(languageCode, '', 'DEFAULTER') || 'Invalid request data',
    data: {},
  };
  return res.status(statusCode).send(resData);
};

export const unAuthentication = (
  languageCode: string = LANGUAGE_CODE.EN,
  res,
  message: string,
  statusCode: number = 401,
  // res: Response,
  data: any = {},
  // code: string = '',
) => {
  const resData = {
    status: false,
    message: getMessage(languageCode, message, 'DEFAULT_AUTH'),
    data,
  };
  return res.status(statusCode).json(resData);
};
