import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudDatabaseInFailedStateException extends HttpException {
  constructor(message = ERROR_MESSAGES.CLOUD_DATABASE_IN_FAILED_STATE, options?: HttpExceptionOptions) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudDatabaseInFailedState',
      errorCode: CustomErrorCodes.CloudDatabaseIsInTheFailedState,
    };

    super(response, response.statusCode, options);
  }
}
