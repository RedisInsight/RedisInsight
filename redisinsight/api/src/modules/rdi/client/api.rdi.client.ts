import axios, { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { decode } from 'jsonwebtoken';

import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import {
  RdiUrl,
  RDI_TIMEOUT,
  TOKEN_TRESHOLD,
  POLLING_INTERVAL,
  MAX_POLLING_TIME,
} from 'src/modules/rdi/constants';
import {
  RdiDryRunJobDto,
  RdiDryRunJobResponseDto,
  RdiTemplateResponseDto,
  RdiTestConnectionsResponseDto,
} from 'src/modules/rdi/dto';
import {
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
      const response = await this.client.get(RdiUrl.GetPipeline);
      return response.data;
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
      const response = await this.client.post(RdiUrl.Deploy, { ...pipeline });
      const actionId = response.data.action_id;

      return this.pollActionStatus(actionId);
    } catch (error) {
      throw wrapRdiPipelineError(error, error.response.data.message);
    }
  }

  async dryRunJob(data: RdiDryRunJobDto): Promise<RdiDryRunJobResponseDto> {
    try {
      const response = await this.client.post(RdiUrl.DryRunJob, data);
      return response.data;
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
      const response = await this.client.get(RdiUrl.GetPipelineStatus);

      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async getStatistics(sections?: string): Promise<RdiStatisticsResult> {
    try {
      const response = await this.client.get(RdiUrl.GetStatistics, { params: { sections } });
      return {
        status: RdiStatisticsStatus.Success,
        data: plainToClass(RdiStatisticsData, convertKeysToCamelCase(response.data)),
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
      const decodedJwt = decode(accessToken);

      this.auth = { jwt: accessToken, exp: decodedJwt.exp };
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async ensureAuth(): Promise<void> {
    const expiresIn = this.auth.exp * 1_000 - Date.now();

    if (expiresIn < TOKEN_TRESHOLD) {
      await this.connect();
    }
  }

  private async pollActionStatus(actionId: string, abortSignal?: AbortSignal): Promise<any> {
    const startTime = Date.now();
    while (true) {
      if (abortSignal?.aborted) {
        throw new RdiPipelineInternalServerErrorException();
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
          throw new RdiPipelineInternalServerErrorException(error?.message);
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
