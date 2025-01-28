import { Server, AddressInfo } from 'net';
import { Client } from 'ssh2';
import { Endpoint } from 'src/common/models';

export type SshTunnelServer = Server;
export type SshTunnelClient = Client;

export interface ISshTunnelOptions {
  targetHost: string;
  targetPort: number;
}

export class SshTunnel {
  public readonly serverAddress: Endpoint;

  constructor(
    private readonly server: SshTunnelServer,
    private readonly client: SshTunnelClient,
    public readonly options: ISshTunnelOptions,
  ) {
    const address = this.server?.address() as AddressInfo;
    this.serverAddress = {
      host: '127.0.0.1',
      port: address?.port,
    };
  }

  public close() {
    return new Promise<void>((resolve) => {
      const cleanup = () => {
        this.client?.end();
        resolve();
      };

      if (this.server?.listening) {
        this.server.close(() => cleanup());
      } else {
        cleanup();
      }
    });
  }
}
