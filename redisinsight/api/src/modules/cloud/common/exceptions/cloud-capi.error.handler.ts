import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions/cloud-api.error.handler';
import { CloudCapiUnauthorizedException } from 'src/modules/cloud/common/exceptions/cloud-capi.unauthorized.exception';

export const wrapCloudCapiError = (error: AxiosError, message?: string): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  if (error.response?.status === 401) {
    return new CloudCapiUnauthorizedException(message, { cause: new Error(error.response?.data as string) });
  }

  return wrapCloudApiError(error, message);
};
