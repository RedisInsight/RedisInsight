import { HttpException, HttpStatus } from '@nestjs/common';

export class WindowUnauthorizedException extends HttpException {
  constructor(message) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
