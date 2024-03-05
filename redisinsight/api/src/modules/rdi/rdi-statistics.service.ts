import { Injectable, Logger } from '@nestjs/common';

import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiStatisticsResult } from 'src/modules/rdi/dto';

@Injectable()
export class RdiStatisticsService {
  private logger: Logger = new Logger('RdiStatisticsService');

  constructor(
    private readonly rdiClientProvider: RdiClientProvider,
  ) {}

  async getStatistics(rdiClientMetadata: RdiClientMetadata, sections?: string): Promise<RdiStatisticsResult> {
    this.logger.log('Getting RDI statistics');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    const result =  await client.getStatistics(sections);

    console.log('___ result', result);

    return result;
  }
}
