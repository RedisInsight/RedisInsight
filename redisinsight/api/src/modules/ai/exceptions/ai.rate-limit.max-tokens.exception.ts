import { HttpException, HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AiRateLimitMaxTokensException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.AI_QUERY_MAX_TOKENS_RATE_LIMIT,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      details: options?.details,
    };

    super(response, response.statusCode, options);
  }
}
