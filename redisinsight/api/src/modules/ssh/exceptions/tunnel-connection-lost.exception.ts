import { HttpException } from '@nestjs/common';

export class TunnelConnectionLostException extends HttpException {
  constructor(message = '') {
    const prepend = 'Tunnel connection was lost.';
    super({
      message: `${prepend} ${message}`,
      name: 'TunnelConnectionLostException',
      statusCode: 500,
    }, 500);
  }
}
