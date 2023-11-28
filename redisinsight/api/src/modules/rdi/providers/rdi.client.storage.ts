import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Injectable, Logger } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';

@Injectable()
export class RdiClientStorage {
  private readonly logger = new Logger('RdiClientStorage');

  private readonly clients: Map<string, RdiClient> = new Map();

  // todo: sync clients (idle check)

  async get(id: string): Promise<RdiClient> {
    const client = this.clients.get(id);

    if (client) {
      client.setLastUsed();
      if (!(await client.isConnected())) {
        await this.delete(id);
        return null;
      }
    }

    return client;
  }

  async getByMetadata(rdiClientMetadata: RdiClientMetadata): Promise<RdiClient> {
    return this.clients.get(RdiClient.generateId(rdiClientMetadata));
  }

  async delete(id: string): Promise<number> {
    const client = this.clients.get(id);

    if (client) {
      await client.disconnect()
        .catch((e) => this.logger.warn('Unable to disconnect client', e));

      this.clients.delete(id);

      return 1;
    }

    return 0;
  }

  async set(client: RdiClient): Promise<RdiClient> {
    // todo: client metadata check
    // todo: existing client check
    // const existingClient = this.get(client.id);
    this.clients.set(client.id, client);

    return client;
  }
}
