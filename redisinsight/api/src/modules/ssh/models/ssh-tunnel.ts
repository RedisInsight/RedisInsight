import { AddressInfo, Server } from 'net';
import { Client } from 'ssh2';
import { Endpoint } from 'src/common/models';

export interface ISshTunnelOptions {
  targetHost: string,
  targetPort: number,
}

export class SshTunnel {
  public readonly serverAddress: Endpoint;

  constructor(
    private readonly server: Server,
    private readonly client: Client,
    public readonly options: ISshTunnelOptions,
  ) {
    const address = this.server?.address() as AddressInfo;
    this.serverAddress = {
      host: address?.address,
      port: address?.port,
    };
  }

  public close() {
    this.server?.close?.();
    this.client?.end?.();
  }
}
