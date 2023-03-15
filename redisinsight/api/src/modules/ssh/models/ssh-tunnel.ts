import { AddressInfo, Server } from 'net';
import { EventEmitter } from 'events';
import { Client } from 'ssh2';
import { Endpoint } from 'src/common/models';
import { UnableToCreateTunnelException } from 'src/modules/ssh/exceptions';

export interface ISshTunnelOptions {
  targetHost: string,
  targetPort: number,
}

export class SshTunnel extends EventEmitter {
  private readonly server: Server;

  private readonly client: Client;

  public readonly serverAddress: Endpoint;

  constructor(server: Server, client: Client, options: ISshTunnelOptions) {
    super();
    this.server = server;
    this.client = client;
    const address = this.server?.address() as AddressInfo;
    this.serverAddress = {
      host: address?.address,
      port: address?.port,
    };

    this.init(options);
  }

  public close() {
    this.server?.close?.();
    this.client?.end?.();
    this.server?.removeAllListeners?.();
    this.client?.removeAllListeners?.();
    this.removeAllListeners();
  }

  private error(e: Error) {
    this.emit('error', e);
  }

  private init(options: ISshTunnelOptions) {
    this.server.on('close', this.close);
    this.client.on('close', this.close);
    // close since net server is not being closed automatically when we need this
    this.server.on('error', this.close);
    this.client.on('error', this.error);

    this.server.on('connection', (connection) => {
      this.client.forwardOut(
        this.serverAddress?.host,
        this.serverAddress?.port,
        options.targetHost,
        options.targetPort,
        (e, stream) => {
          if (e) {
            return this.emit('error', new UnableToCreateTunnelException(e.message));
          }

          return connection.pipe(stream).pipe(connection);
        },
      );

      connection.on('error', (e) => {
        this.client.emit('error', e);
      });

      connection.on('close', () => {
        // close server and client connections (entire tunnel) when forward connection was lost
        // todo: improve this to keep tunnel connection when there are active forward connections inside
        this.close();
      });
    });
  }
}
