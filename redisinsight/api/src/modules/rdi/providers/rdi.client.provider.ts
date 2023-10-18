import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Injectable } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiService } from 'src/modules/rdi/rdi.service';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';

@Injectable()
export class RdiClientProvider {
  constructor(
    private readonly rdiService: RdiService,
    private readonly rdiClientStorage: RdiClientStorage,
    private readonly rdiClientFactory: RdiClientFactory,
  ) {}

  async getOrCreate(rdiClientMetadata: RdiClientMetadata): Promise<RdiClient> {
    let client = await this.rdiClientStorage.getByMetadata(rdiClientMetadata);

    if (client) {
      return client;
    }

    client = await this.create(rdiClientMetadata);

    return this.rdiClientStorage.set(client);
  }

  async create(clientMetadata: RdiClientMetadata): Promise<RdiClient> {
    const rdi = await this.rdiService.get(clientMetadata.id);

    return this.rdiClientFactory.createClient(clientMetadata, rdi);
  }
}
