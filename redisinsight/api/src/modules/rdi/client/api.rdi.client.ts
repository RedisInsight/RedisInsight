import { RdiJob, RdiPipeline, RdiType } from 'src/modules/rdi/models';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { RdiUrl } from 'src/modules/rdi/constants';
import { AxiosInstance } from 'axios';
import { RdiDryRunJobDto, RdiDryRunJobResponseDto, RdiTestConnectionResult } from 'src/modules/rdi/dto';
import { RdiDyRunJobStatus, RdiDryRunJobResult } from 'src/modules/rdi/models/rdi-dry-run';
import { RdiPipelineDeployFailedException } from 'src/modules/rdi/exceptions';

const RDI_DEPLOY_FAILED_STATUS = 'failed';

export class ApiRdiClient extends RdiClient {
  public type = RdiType.API;

  protected readonly client: AxiosInstance;

  async isConnected(): Promise<boolean> {
    // todo: check if needed and possible
    return true;
  }

  async getSchema(): Promise<object> {
    const response = await this.client.get(RdiUrl.GetSchema);
    return response.data;
  }

  async getPipeline(): Promise<RdiPipeline> {
    const response = await this.client.get(RdiUrl.GetPipeline);
    return response.data;
  }

  async getStrategies(): Promise<object> {
    const response = await this.client.get(RdiUrl.GetStrategies);
    return response.data;
  }

  async getTemplate(options: object): Promise<object> {
    const response = await this.client.get(RdiUrl.GetTemplate, { params: options });
    return response.data;
  }

  async deploy(pipeline: RdiPipeline): Promise<void> {
    const response = await this.client.post(RdiUrl.Deploy, { ...pipeline });

    if (response.data?.status === RDI_DEPLOY_FAILED_STATUS) {
      throw new RdiPipelineDeployFailedException(undefined, { error: response.data?.error });
    }
  }

  async deployJob(job: RdiJob): Promise<RdiJob> {
    return null;
  }

  async dryRunJob(data: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    const response = await Promise.all(
      [this.getDryRunJobTransformations(data), this.getDryRunJobCommands(data)],
    );
    return ({ transformations: response[0], commands: response[1] });
  }

  async getDryRunJobTransformations(data: RdiDryRunJobDto): Promise<RdiDryRunJobResult> {
    try {
      const transformations = await this.client.post(
        RdiUrl.DryRunJob,
        { input: data.input, job: data.job, test_output: false },
      );
      return ({ status: RdiDyRunJobStatus.Success, data: transformations.data });
    } catch (e) {
      return ({ status: RdiDyRunJobStatus.Fail, error: e.message });
    }
  }

  async getDryRunJobCommands(data: RdiDryRunJobDto): Promise<RdiDryRunJobResult> {
    try {
      const commands = await this.client.post(
        RdiUrl.DryRunJob,
        { input: data.input, job: data.job, test_output: true },
      );
      return ({ status: RdiDyRunJobStatus.Success, data: commands.data });
    } catch (e) {
      return ({ status: RdiDyRunJobStatus.Fail, error: e.message });
    }
  }

  async testConnections(config: string): Promise<RdiTestConnectionResult> {
    const response = await this.client.post(
      RdiUrl.TestConnections,
      { config },
    );
    return response.data;
  }

  async disconnect(): Promise<void> {
    return undefined;
  }
}
