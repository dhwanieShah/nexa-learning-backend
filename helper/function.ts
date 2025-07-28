import * as bcrypt from 'bcryptjs';
import * as ffmpeg from 'fluent-ffmpeg';


export const randomSixDigit = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const randomFourDigits = (): string => {
  const randomArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const random1 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random2 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random3 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const random4 = randomArray[Math.floor(Math.random() * randomArray.length)];
  const otp = random4 + random3 + random2 + random1;
  return otp;
};

export const replaceNullToBlankString = async (obj: any): Promise<any> => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) {
      obj[key] = '';
    }
  });
  return obj;
};

export const validatePassword = async (password: string): Promise<boolean> => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?!.*\s).{8,}$/;
  return passwordRegex.test(password);
};

export const hashPasswordWithBcrypt = async (string_value: string): Promise<string> => {
  const hash = bcrypt.hashSync(string_value, 10);
  return hash;
};

export const matchPasswordWithBcrypt = async (password: string, encryptedPassword: string): Promise<boolean> => {
  const decryptedString = bcrypt.compareSync(password, encryptedPassword);
  return decryptedString;
};

export const generatePassword = async (): Promise<string> => {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allowedCharacters = uppercaseLetters + numbers;

  const getRandomChar = (str: string): string => str[Math.floor(Math.random() * str.length)];

  let password = '';

  password += getRandomChar(uppercaseLetters);
  password += getRandomChar(numbers);

  const requiredLength = 8;
  const remainingLength = requiredLength - password.length;

  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(allowedCharacters);
  }

  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
};

export const matchPasswordForSimpleString = async (password: string, confirmPassword: string): Promise<boolean> => {
  return password === confirmPassword;
};

export const generateUniqueUsername = async (): Promise<string> => {
  const prefix = 'guest';
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(5, 8);
  const uniqueUsername = `${prefix}${randomString}_${randomSuffix}`;
  return uniqueUsername;
};

export const timeToSeconds = async (timeString: string): Promise<number> => {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
};

export const getVideoDuration = (videoFile: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoFile, (err, metadata) => {
      if (err) {
        console.error('Error while getting video metadata:', err);
        console.error('File path:', videoFile);
        reject(err);
      } else if (metadata && metadata.format && metadata.format.duration) {
        const duration = metadata.format.duration;
        console.log('Total duration in seconds:', duration);
        resolve(duration);
      } else {
        const errorMessage = 'Invalid metadata format or duration information missing.';
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  });
};

export const getVideoDurationWithRetry = async (videoFile: string, maxRetries = 3, retryDelay = 5000): Promise<number> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const duration = await getVideoDuration(videoFile);
      console.log('Line 160 -> Total duration in seconds:', duration);
      return duration;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error('Max retries reached. Operation failed.');
        throw error;
      }
    }
  }
};
