import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions/cloud-api.unauthorized.exception';
import { CloudApiForbiddenException } from 'src/modules/cloud/common/exceptions/cloud-api.forbidden.exception';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions/cloud-api.bad-request.exception';
import { CloudApiNotFoundException } from 'src/modules/cloud/common/exceptions/cloud-api.not-found.exception';
import {
  CloudApiInternalServerErrorException,
} from 'src/modules/cloud/common/exceptions/cloud-api.internal-server-error.exception';

export const wrapCloudApiError = (error: AxiosError, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;

  if (response) {
    const errorOptions = { cause: new Error(response?.data as string) };
    switch (response?.status) {
      case 401:
        return new CloudApiUnauthorizedException(message, errorOptions);
      case 403:
        return new CloudApiForbiddenException(message, errorOptions);
      case 400:
        return new CloudApiBadRequestException(message, errorOptions);
      case 404:
        return new CloudApiNotFoundException(message, errorOptions);
      default:
        return new CloudApiInternalServerErrorException(message, errorOptions);
    }
  }

  return new CloudApiInternalServerErrorException(message);
};
