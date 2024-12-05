import { Injectable } from '@nestjs/common';
import { RdiClientMetadata, RdiStatisticsResult } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import LoggerService from '../logger/logger.service';

@Injectable()
export class RdiStatisticsService {
  constructor(
    private logger: LoggerService,
    private readonly rdiClientProvider: RdiClientProvider,
  ) {}

  async getStatistics(rdiClientMetadata: RdiClientMetadata, sections?: string): Promise<RdiStatisticsResult> {
    this.logger.debug('Getting RDI statistics', rdiClientMetadata);

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getStatistics(sections);
  }
}
