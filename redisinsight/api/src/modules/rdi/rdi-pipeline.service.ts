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
    this.logger.debug('Getting RDI pipeline schema');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getSchema();
  }

  async getPipeline(rdiClientMetadata: RdiClientMetadata): Promise<RdiPipeline> {
    this.logger.debug('Getting RDI pipeline');

    try {
      const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

      const pipeline = await client.getPipeline();

      this.analytics.sendRdiPipelineFetched(rdiClientMetadata.sessionMetadata, rdiClientMetadata.id, pipeline);

      this.logger.debug('Succeed to get RDI pipeline');

      return pipeline;
    } catch (e) {
      this.logger.error('Failed to get RDI pipeline', e);

      this.analytics.sendRdiPipelineFetchFailed(rdiClientMetadata.sessionMetadata, e, rdiClientMetadata.id);
      throw wrapHttpError(e);
    }
  }

  async dryRunJob(rdiClientMetadata: RdiClientMetadata, dto: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    this.logger.debug('Trying dry run job');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.dryRunJob(dto);
  }

  async deploy(rdiClientMetadata: RdiClientMetadata, dto: RdiPipeline): Promise<void> {
    this.logger.debug('Trying to deploy pipeline');

    try {
      const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

      await client.deploy(dto);

      this.analytics.sendRdiPipelineDeployed(rdiClientMetadata.sessionMetadata, rdiClientMetadata.id);
      this.logger.debug('Succeed to deploy pipeline');
    } catch (e) {
      this.analytics.sendRdiPipelineDeployFailed(rdiClientMetadata.sessionMetadata, e, rdiClientMetadata.id);

      this.logger.error('Failed to deploy pipeline', e);

      throw wrapHttpError(e);
    }
  }

  async stopPipeline(rdiClientMetadata: RdiClientMetadata): Promise<void> {
    this.logger.debug('Stopping running pipeline');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.stopPipeline();
  }

  async startPipeline(rdiClientMetadata: RdiClientMetadata): Promise<void> {
    this.logger.debug('Starting stopped pipeline');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.startPipeline();
  }

  async resetPipeline(rdiClientMetadata: RdiClientMetadata): Promise<void> {
    this.logger.debug('Resetting default pipeline');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.resetPipeline();
  }

  async testConnections(rdiClientMetadata: RdiClientMetadata, config: object): Promise<RdiTestConnectionsResponseDto> {
    this.logger.debug('Trying to test connections');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.testConnections(config);
  }

  async getStrategies(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.debug('Getting RDI pipeline strategies');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getStrategies();
  }

  async getConfigTemplate(rdiClientMetadata: RdiClientMetadata, pipelineType: string, dbType: string): Promise<RdiTemplateResponseDto> {
    this.logger.debug('Getting RDI config template');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getConfigTemplate(pipelineType, dbType);
  }

  async getJobTemplate(rdiClientMetadata: RdiClientMetadata, pipelineType: string): Promise<RdiTemplateResponseDto> {
    this.logger.debug('Getting RDI job template');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getJobTemplate(pipelineType);
  }

  async getPipelineStatus(rdiClientMetadata: RdiClientMetadata): Promise<unknown> {
    this.logger.debug('Getting RDI pipeline status');

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getPipelineStatus();
  }

  async getJobFunctions(rdiClientMetadata: RdiClientMetadata): Promise<object> {
    this.logger.debug('Getting RDI job functions');
    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    return await client.getJobFunctions();
  }
}
