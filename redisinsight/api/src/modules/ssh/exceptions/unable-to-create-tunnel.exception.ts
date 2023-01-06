import { HttpException } from '@nestjs/common';

export class UnableToCreateTunnelException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create tunnel.';
    super({
      message: `${prepend} ${message}`,
      name: 'UnableToCreateTunnelException',
      statusCode: 500,
    }, 500);
  }
}
