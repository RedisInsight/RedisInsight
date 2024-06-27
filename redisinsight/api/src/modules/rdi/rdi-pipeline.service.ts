import { Injectable, Logger } from '@nestjs/common';
import { RdiClientMetadata, RdiPipeline } from 'src/modules/rdi/models';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { RdiDryRunJobDto, RdiTemplateResponseDto, RdiTestConnectionsResponseDto } from 'src/modules/rdi/dto';
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

    try {
      const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

      const response = await client.getPipeline();

      this.analytics.sendRdiPipelineFetched(rdiClientMetadata.id, response);

      this.logger.log('Succeed to get RDI pipeline');
      return response;
    } catch (e) {
      this.logger.error('Failed to get RDI pipeline', e);

      this.analytics.sendRdiPipelineFetchFailed(e, rdiClientMetadata.id);
      throw wrapHttpError(e);
    }
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

  async testConnections(rdiClientMetadata: RdiClientMetadata, config: object): Promise<RdiTestConnectionsResponseDto> {
    this.logger.log('Trying to test connections');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.testConnections(config);
  }

  async getStrategies(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.log('Getting RDI pipeline strategies');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getStrategies();
  }

  async getConfigTemplate(rdiClientMetadata: RdiClientMetadata, pipelineType: string, dbType: string): Promise<RdiTemplateResponseDto> {
    this.logger.log('Getting RDI config template');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getConfigTemplate(pipelineType, dbType);
  }

  async getJobTemplate(rdiClientMetadata: RdiClientMetadata, pipelineType: string): Promise<RdiTemplateResponseDto> {
    this.logger.log('Getting RDI job template');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getJobTemplate(pipelineType);
  }

  async getPipelineStatus(rdiClientMetadata: RdiClientMetadata): Promise<unknown> {
    this.logger.log('Getting RDI pipeline status');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getPipelineStatus();
  }

  async getJobFunctions(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.log('Getting RDI job functions');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getJobFunctions();
  }
}
