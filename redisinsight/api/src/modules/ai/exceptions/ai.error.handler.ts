import { get } from 'lodash';
import { HttpException } from '@nestjs/common';
import {
  AiUnauthorizedException,
  AiForbiddenException,
  AiBadRequestException,
  AiNotFoundException,
  AiInternalServerErrorException,
  AiRateLimitRequestException, AiRateLimitTokenException, AiRateLimitMaxTokensException,
} from 'src/modules/ai/exceptions';
import { AiServerErrors } from 'src/modules/ai/messages/models';

export const wrapAiError = (error: any, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  // ai errors to handle
  if (error.error) {
    switch (error.error) {
      case AiServerErrors.RateLimitRequest:
        return new AiRateLimitRequestException(error.message, { details: error.data });
      case AiServerErrors.RateLimitToken:
        return new AiRateLimitTokenException(error.message, { details: error.data });
      case AiServerErrors.MaxTokens:
        return new AiRateLimitMaxTokensException(error.message, { details: error.data });
      default:
        // go further
    }
  }

  // TransportError or Axios error
  const response = get(error, ['description', 'target', '_req', 'res'], error.response);

  if (response) {
    const errorOptions = { cause: new Error(response.data as string) };
    switch (response.status || response.statusCode) {
      case 401:
        return new AiUnauthorizedException(message, errorOptions);
      case 403:
        return new AiForbiddenException(message, errorOptions);
      case 400:
        return new AiBadRequestException(message, errorOptions);
      case 404:
        return new AiNotFoundException(message, errorOptions);
      default:
        return new AiInternalServerErrorException(message, errorOptions);
    }
  }

  return new AiInternalServerErrorException(message);
};
