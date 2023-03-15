import { HttpException } from '@nestjs/common';

export class UnableToCreateLocalServerException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create local server.';
    super({
      message: `${prepend} ${message}`,
      name: 'UnableToCreateLocalServerException',
      statusCode: 500,
    }, 500);
  }
}
