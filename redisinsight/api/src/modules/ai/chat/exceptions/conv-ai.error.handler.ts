import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  ConvAiBadRequestException,
  ConvAiForbiddenException, ConvAiInternalServerErrorException,
  ConvAiUnauthorizedException,
} from 'src/modules/ai/chat/exceptions';
import { ConvAiNotFoundException } from 'src/modules/ai/chat/exceptions/conv-ai.not-found.exception';

export const wrapConvAiError = (error: AxiosError, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;

  if (response) {
    const errorOptions = { cause: new Error(response?.data as string) };
    switch (response?.status) {
      case 401:
        return new ConvAiUnauthorizedException(message, errorOptions);
      case 403:
        return new ConvAiForbiddenException(message, errorOptions);
      case 400:
        return new ConvAiBadRequestException(message, errorOptions);
      case 404:
        return new ConvAiNotFoundException(message, errorOptions);
      default:
        return new ConvAiInternalServerErrorException(message, errorOptions);
    }
  }

  return new ConvAiInternalServerErrorException(message);
};
