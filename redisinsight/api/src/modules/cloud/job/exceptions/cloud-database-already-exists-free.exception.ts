import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudDatabaseAlreadyExistsFreeException extends HttpException {
  constructor(message = ERROR_MESSAGES.CLOUD_DATABASE_ALREADY_EXISTS_FREE, options?: HttpExceptionOptions) {
    const response = {
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'CloudDatabaseAlreadyExistsFree',
      errorCode: CustomErrorCodes.CloudDatabaseAlreadyExistsFree,
    };

    super(response, response.statusCode, options);
  }
}
