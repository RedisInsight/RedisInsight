import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  AiQueryUnauthorizedException,
  AiQueryForbiddenException,
  AiQueryBadRequestException,
  AiQueryNotFoundException,
  AiQueryInternalServerErrorException,
} from 'src/modules/ai/query/exceptions';

export const wrapAiQueryError = (error: AxiosError, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;

  if (response) {
    const errorOptions = { cause: new Error(response?.data as string) };
    switch (response?.status) {
      case 401:
        return new AiQueryUnauthorizedException(message, errorOptions);
      case 403:
        return new AiQueryForbiddenException(message, errorOptions);
      case 400:
        return new AiQueryBadRequestException(message, errorOptions);
      case 404:
        return new AiQueryNotFoundException(message, errorOptions);
      default:
        return new AiQueryInternalServerErrorException(message, errorOptions);
    }
  }

  return new AiQueryInternalServerErrorException(message);
};
