import { HttpException, InternalServerErrorException } from '@nestjs/common';

export const wrapHttpError = (error: Error) => {
  if (error instanceof HttpException) {
    return error;
  }

  return new InternalServerErrorException(error.message);
};
