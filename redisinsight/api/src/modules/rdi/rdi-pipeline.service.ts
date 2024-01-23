import { Injectable, Logger } from '@nestjs/common';
import { RdiClientMetadata, RdiPipeline } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiDryRunJobDto } from 'src/modules/rdi/dto';
import { RdiDryRunJobResponseDto } from 'src/modules/rdi/dto/rdi.dry-run.job.response.dto';
import { RdiPipelineAnalytics } from 'src/modules/rdi/rdi-pipeline.analytics';
import { wrapHttpError } from 'src/common/utils';

@Injectable()
export class RdiPipelineService {
  private logger: Logger = new Logger('RdiPipelineService');

  constructor(
    private readonly rdiClientProvider: RdiClientProvider,
    private readonly analytics: RdiPipelineAnalytics,
  ) {}

  async getSchema(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.log('Getting RDI pipeline schema');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getSchema();
  }

  async getPipeline(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.log('Getting RDI pipeline');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getPipeline();
  }

  async dryRunJob(rdiClientMetadata: RdiClientMetadata, dto: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    this.logger.log('Trying dry run job');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.dryRunJob(dto);
  }

  async deploy(rdiClientMetadata: RdiClientMetadata, dto: RdiPipeline): Promise<void> {
    this.logger.log('Trying to deploy pipeline');

    try {
      const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

      await client.deploy(dto);

      this.analytics.sendRdiPipelineDeployed(rdiClientMetadata.id);
      this.logger.log('Succeed to deploy pipeline');
    } catch (e) {
      this.analytics.sendRdiPipelineDeployFailed(e, rdiClientMetadata.id);

      this.logger.error('Failed to deploy pipeline', e);

      throw wrapHttpError(e);
    }
  }
}
