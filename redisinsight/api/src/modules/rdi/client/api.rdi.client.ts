import axios, { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import {
  RdiUrl,
  RDI_TIMEOUT,
  TOKEN_THRESHOLD,
  POLLING_INTERVAL,
  MAX_POLLING_TIME,
  WAIT_BEFORE_POLLING,
} from 'src/modules/rdi/constants';
import {
  RdiDryRunJobDto,
  RdiDryRunJobResponseDto,
  RdiTemplateResponseDto,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import {
  RdiPipelineDeployFailedException,
  RdiPipelineInternalServerErrorException,
  wrapRdiPipelineError,
} from 'src/modules/rdi/exceptions';
import {
  RdiPipeline,
  RdiStatisticsResult,
  RdiStatisticsStatus,
  RdiStatisticsData, RdiClientMetadata, Rdi,
} from 'src/modules/rdi/models';
import { convertKeysToCamelCase } from 'src/utils/base.helper';
import { RdiPipelineTimeoutException } from 'src/modules/rdi/exceptions/rdi-pipeline.timeout-error.exception';
import * as https from 'https';
import { convertApiDataToRdiPipeline, convertRdiPipelineToApiPayload } from 'src/modules/rdi/utils/pipeline.util';

export class ApiRdiClient extends RdiClient {
  protected readonly client: AxiosInstance;

  private auth: { jwt: string, exp: number };

  constructor(clientMetadata: RdiClientMetadata, rdi: Rdi) {
    super(clientMetadata, rdi);
    this.client = axios.create({
      baseURL: rdi.url,
      timeout: RDI_TIMEOUT,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  async getSchema(): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.GetSchema);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getPipeline(): Promise<RdiPipeline> {
    try {
      const { data } = await this.client.get(RdiUrl.GetPipeline);

      return convertApiDataToRdiPipeline(data);
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getStrategies(): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.GetStrategies);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getConfigTemplate(pipelineType: string, dbType: string): Promise<RdiTemplateResponseDto> {
    try {
      const response = await this.client.get(`${RdiUrl.GetConfigTemplate}/${pipelineType}/${dbType}`);
      return response.data;
    } catch (error) {
      throw wrapRdiPipelineError(error);
    }
  }

  async getJobTemplate(pipelineType: string): Promise<RdiTemplateResponseDto> {
    try {
      const response = await this.client.get(`${RdiUrl.GetJobTemplate}/${pipelineType}`);
      return response.data;
    } catch (error) {
      throw wrapRdiPipelineError(error);
    }
  }

  async deploy(pipeline: RdiPipeline): Promise<void> {
    try {
      const response = await this.client.post(
        RdiUrl.Deploy,
        convertRdiPipelineToApiPayload(pipeline),
      );

      const actionId = response.data.action_id;

      return await this.pollActionStatus(actionId);
    } catch (error) {
      throw wrapRdiPipelineError(error, error.response.data.message);
    }
  }

  async dryRunJob(dto: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    try {
      const { data } = await this.client.post(RdiUrl.DryRunJob, dto);

      return data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async testConnections(config: object): Promise<RdiTestConnectionsResponseDto> {
    try {
      const response = await this.client.post(
        RdiUrl.TestConnections,
        config,
      );

      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getPipelineStatus(): Promise<any> {
    try {
      const { data } = await this.client.get(RdiUrl.GetPipelineStatus);

      return data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getStatistics(sections?: string): Promise<RdiStatisticsResult> {
    try {
      const { data } = await this.client.get(RdiUrl.GetStatistics, { params: { sections } });

      return {
        status: RdiStatisticsStatus.Success,
        data: plainToClass(RdiStatisticsData, convertKeysToCamelCase(data)),
      };
    } catch (e) {
      return { status: RdiStatisticsStatus.Fail, error: e.message };
    }
  }

  async getJobFunctions(): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.JobFunctions);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async connect(): Promise<void> {
    try {
      const response = await this.client.post(
        RdiUrl.Login,
        { username: this.rdi.username, password: this.rdi.password },
      );
      const accessToken = response.data.access_token;
      const { exp } = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

      this.auth = { jwt: accessToken, exp };
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async ensureAuth(): Promise<void> {
    const expiresIn = this.auth.exp * 1_000 - Date.now();

    if (expiresIn < TOKEN_THRESHOLD) {
      await this.connect();
    }
  }

  private async pollActionStatus(actionId: string, abortSignal?: AbortSignal): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, WAIT_BEFORE_POLLING));

    const startTime = Date.now();

    while (true) {
      if (abortSignal?.aborted) {
        throw new RdiPipelineInternalServerErrorException('Operation is aborted');
      }
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        throw new RdiPipelineTimeoutException();
      }

      try {
        const response = await this.client.get(
          `${RdiUrl.Action}/${actionId}`,
          { signal: abortSignal },
        );
        const { status, data, error } = response.data;

        if (status === 'failed') {
          throw new RdiPipelineDeployFailedException(error?.message);
        }

        if (status === 'completed') {
          return data;
        }
      } catch (e) {
        throw wrapRdiPipelineError(e);
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
  }
}
