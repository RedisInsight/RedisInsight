import { Injectable } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';

@Injectable()
export class RdiPipelineService {
  constructor(
    private readonly rdiClientProvider: RdiClientProvider,
  ) {}

  async getSchema(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getSchema();
  }

  async getPipeline(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getPipeline();
  }
}
