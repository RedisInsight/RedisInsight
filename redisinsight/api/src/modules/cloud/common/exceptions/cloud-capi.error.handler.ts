import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions/cloud-api.error.handler';

export const wrapCloudCapiError = (error: AxiosError, message?: string): HttpException => {
  return wrapCloudApiError(error, message);
};
