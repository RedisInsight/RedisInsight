import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  RdiPipelineInternalServerErrorException,
  RdiPipelineUnauthorizedException, RdiPipelineNotFoundException, RdiPipelineValidationException,
} from 'src/modules/rdi/exceptions';

export const wrapRdiPipelineError = (error: AxiosError<any>, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;

  if (response) {
    const errorOptions = response?.data?.detail;
    switch (response?.status) {
      case 401:
        return new RdiPipelineUnauthorizedException(message, errorOptions);
      case 422:
        return new RdiPipelineValidationException(message, errorOptions);
      default:
        return new RdiPipelineNotFoundException(message, errorOptions);
    }
  }

  return new RdiPipelineInternalServerErrorException(message);
};
