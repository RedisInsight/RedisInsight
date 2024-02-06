import { HttpException, Injectable } from '@nestjs/common';
import * as detectPort from 'detect-port';
import { Database } from 'src/modules/database/models/database';
import { Server, createServer } from 'net';
import { Client } from 'ssh2';
import { createTunnel } from 'tunnel-ssh';
import { SshTunnel } from 'src/modules/ssh/models/ssh-tunnel';
import {
  UnableToCreateLocalServerException,
  UnableToCreateSshConnectionException,
  UnableToCreateTunnelException,
} from 'src/modules/ssh/exceptions';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

@Injectable()
export class SshTunnelProvider {
  private async createServer(): Promise<Server> {
    return new Promise((resolve, reject) => {
      try {
        const server = createServer();

        server.on('listening', () => resolve(server));
        server.on('error', (e) => {
          reject(new UnableToCreateLocalServerException(e.message));
        });

        detectPort({
          hostname: '127.0.0.1',
          port: 50000,
        })
          .then((port) => {
            server.listen({
              host: '127.0.0.1',
              port,
            });
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }

  private async createClient(options): Promise<Client> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn.on('ready', () => resolve(conn));
      conn.on('error', (e) => {
        reject(new UnableToCreateSshConnectionException(e.message));
      });
      conn.connect(options);
    });
  }

  public async createTunnel(database: Database) {
    try {
      const client = await this.createClient(database?.sshOptions);
      const server = await this.createServer();

      return new SshTunnel(server, client, {
        targetHost: database.host,
        targetPort: database.port,
      });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new UnableToCreateTunnelException(e.message);
    }
  }

  public async createTunnelNew(target: { host: string, port: number }, sshOptions: SshOptions) {
    const tnl = await createTunnel({
      autoClose: true,
    }, {
      host: '127.0.0.1',
    }, {
      ...sshOptions,
    }, {
      dstAddr: target.host,
      dstPort: target.port,
    });

    return tnl;
  }
}
