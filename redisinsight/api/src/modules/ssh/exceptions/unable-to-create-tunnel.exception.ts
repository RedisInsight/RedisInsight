import { HttpException } from '@nestjs/common';

export class UnableToCreateTunnelException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create tunnel.';

    let msg = message;

    if (message.includes('Cannot parse privateKey')) {
      msg = 'Cannot parse privateKey';
    }

    super({
      message: `${prepend} ${msg}`,
      name: 'UnableToCreateTunnelException',
      statusCode: 500,
    }, 500);
  }
}
