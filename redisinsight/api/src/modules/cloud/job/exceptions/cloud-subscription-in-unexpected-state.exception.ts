import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudSubscriptionInUnexpectedStateException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_SUBSCRIPTION_IN_UNEXPECTED_STATE,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudSubscriptionInUnexpectedState',
      errorCode: CustomErrorCodes.CloudSubscriptionIsInUnexpectedState,
    };

    super(response, response.statusCode, options);
  }
}
