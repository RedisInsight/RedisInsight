import { Injectable } from '@nestjs/common';
import { createConnection } from 'net';
import { AbstractWindowAuthStrategy } from './abstract.window.auth.strategy';

@Injectable()
export class ElectronWindowAuthStrategy extends AbstractWindowAuthStrategy {
  private static DEFAULT_AUTH_PORT = 5541;
  private authPort: number;
  
  constructor() {
    super();
    this.authPort = parseInt(process.env.RI_AUTH_PORT || ElectronWindowAuthStrategy.DEFAULT_AUTH_PORT.toString(), 10);

    if (isNaN(this.authPort)) {
      this.authPort = ElectronWindowAuthStrategy.DEFAULT_AUTH_PORT;
    }
  }

  async isAuthorized(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const client = createConnection(this.authPort, 'localhost', () => {
        client.write(id);
      });

      client.on('data', (data) => {
        const isValid = data.toString() === '1';
        client.end();
        resolve(isValid);
      });

      client.on('error', (err) => {
        resolve(false);
      });

      // Don't end the connection until we get data or timeout
      setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 5000);
    });
  }
}
