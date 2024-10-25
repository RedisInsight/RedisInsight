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
    console.log('test electron.window.auth.strategy constructor', this.authPort)
    if (isNaN(this.authPort)) {
      this.authPort = ElectronWindowAuthStrategy.DEFAULT_AUTH_PORT;
    }
    
    console.log('ElectronWindowAuthStrategy initialized with port:', this.authPort);
  }

  async isAuthorized(id: string): Promise<boolean> {
    console.log('[API] Starting authorization for ID:', id);
    return new Promise((resolve) => {
      const client = createConnection(this.authPort, 'localhost', () => {
        console.log('[API] Connected, writing ID:', id);
        client.setEncoding('utf8');
        client.write(id, 'utf8');
      });

      client.on('data', (data) => {
        console.log('[API] Received response:', data.toString());
        const isValid = data.toString() === '1';
        client.end();
        resolve(isValid);
      });

      client.on('error', (err) => {
        console.error('[API] Connection error:', err);
        resolve(false);
      });

      // Don't end the connection until we get data or timeout
      setTimeout(() => {
        console.log('[API] Auth request timed out');
        client.destroy();
        resolve(false);
      }, 5000);
    });
  }
}
