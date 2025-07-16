import { get } from 'lodash';
import { HttpException } from '@nestjs/common';
import { AiRdiServerErrors } from 'src/modules/ai/rdi/models';
import { AiRdiRateLimitMaxTokensException } from './ai-rdi.rate-limit.max-tokens.exception';
import { AiRdiRateLimitTokenException } from './ai-rdi.rate-limit.token.exception';
import { AiRdiRateLimitRequestException } from './ai-rdi.rate-limit.request.exception';
import { AiRdiNotFoundException } from './ai-rdi.not-found.exception';
import { AiRdiBadRequestException } from './ai-rdi.bad-request.exception';
import { AiRdiForbiddenException } from './ai-rdi.forbidden.exception';
import { AiRdiUnauthorizedException } from './ai-rdi.unauthorized.exception';
import { AiRdiInternalServerErrorException } from './ai-rdi.internal-server-error.exception';

export const wrapAiRdiError = (error: any, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  // ai errors to handle
  if (error.error) {
    switch (error.error) {
      case AiRdiServerErrors.RateLimitRequest:
        return new AiRdiRateLimitRequestException(error.message, {
          details: error.data,
        });
      case AiRdiServerErrors.RateLimitToken:
        return new AiRdiRateLimitTokenException(error.message, {
          details: error.data,
        });
      case AiRdiServerErrors.MaxTokens:
        return new AiRdiRateLimitMaxTokensException(error.message, {
          details: error.data,
        });
      default:
      // go further
    }
  }

  // TransportError or Axios error
  const response = get(
    error,
    ['description', 'target', '_req', 'res'],
    error.response,
  );

  if (response) {
    const errorOptions = { cause: new Error(response.data as string) };
    switch (response.status || response.statusCode) {
      case 401:
        return new AiRdiUnauthorizedException(message, errorOptions);
      case 403:
        return new AiRdiForbiddenException(message, errorOptions);
      case 400:
        return new AiRdiBadRequestException(message, errorOptions);
      case 404:
        return new AiRdiNotFoundException(message, errorOptions);
      default:
        return new AiRdiInternalServerErrorException(message, errorOptions);
    }
  }

  return new AiRdiInternalServerErrorException(message);
};
