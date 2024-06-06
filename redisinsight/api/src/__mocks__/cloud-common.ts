import { HttpStatus } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export const mockCapiUnauthorizedError = {
  message: 'Request failed with status code 401',
  response: {
    status: 401,
  },
};

export const mockSmApiUnauthorizedError = mockCapiUnauthorizedError;

export const mockSmApiInternalServerError = {
  message: 'Something wrong',
  response: {
    status: 500,
  },
};

export const mockSmApiBadRequestError = {
  message: 'Bad Request',
  response: {
    status: 400,
  },
};

export const mockUtm = {
  source: 'redisinsight',
  medium: 'sso',
  campaign: 'workbench',
};

export const mockCloudApiUnauthorizedExceptionResponse = {
  error: 'CloudApiUnauthorized',
  errorCode: CustomErrorCodes.CloudApiUnauthorized,
  message: ERROR_MESSAGES.UNAUTHORIZED,
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const mockCloudApiBadRequestExceptionResponse = {
  error: 'CloudApiBadRequest',
  errorCode: CustomErrorCodes.CloudApiBadRequest,
  message: ERROR_MESSAGES.BAD_REQUEST,
  statusCode: HttpStatus.BAD_REQUEST,
};
