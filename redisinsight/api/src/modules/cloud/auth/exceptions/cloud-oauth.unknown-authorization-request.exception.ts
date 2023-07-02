import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthUnknownAuthorizationRequestException extends HttpException {
  constructor(message = ERROR_MESSAGES.CLOUD_OAUTH_GITHUB_UNKNOWN_AUTHORIZATION_REQUEST, options?: HttpExceptionOptions) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudOauthGithubEmailPermission',
      errorCode: CustomErrorCodes.CloudOauthGithubEmailPermission,
    };

    super(response, response.statusCode, options);
  }
}
