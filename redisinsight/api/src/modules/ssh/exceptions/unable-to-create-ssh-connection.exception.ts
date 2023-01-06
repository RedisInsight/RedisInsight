import { HttpException } from '@nestjs/common';

export class UnableToCreateSshConnectionException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create ssh connection.';
    super({
      message: `${prepend} ${message}`,
      name: 'UnableToCreateSshConnectionException',
      statusCode: 503,
    }, 503);
  }
}
