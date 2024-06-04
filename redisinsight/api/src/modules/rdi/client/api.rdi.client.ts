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

const RDI_DEPLOY_FAILED_STATUS = 'failed';

export class ApiRdiClient extends RdiClient {
  protected readonly client: AxiosInstance;

  private auth: { jwt: string, exp: number };

  constructor(clientMetadata: RdiClientMetadata, rdi: Rdi) {
    super(clientMetadata, rdi);
    this.client = axios.create({
      baseURL: rdi.url,
      timeout: RDI_TIMEOUT,
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

  async getTemplate(options: object): Promise<object> {
    try {
      const response = await this.client.get(RdiUrl.GetTemplate, { params: options });
      return response.data;
    } catch (error) {
      throw wrapRdiPipelineError(error);
    }
  }

  async deploy(pipeline: RdiPipeline): Promise<void> {
    let response;
    try {
      response = await this.client.post(RdiUrl.Deploy, { ...pipeline });
    } catch (error) {
      throw wrapRdiPipelineError(error, error.response.data.message);
    }

    if (response.data?.status === RDI_DEPLOY_FAILED_STATUS) {
      throw new RdiPipelineDeployFailedException(undefined, { error: response.data?.error });
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

  async testConnections(config: string): Promise<RdiTestConnectionsResponseDto> {
    try {
      const response = await this.client.post(RdiUrl.TestConnections, config);

      const actionId = response.data.action_id;

      return this.pollActionStatus(actionId);
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
      const response = await this.client.post(RdiUrl.JobFunctions);
      return response.data;
    } catch (e) {
      throw wrapRdiPipelineError(e);
    }
  }

  async connect(): Promise<void> {
    console.log('conenct')
    try {
      const response = await this.client.post(
        RdiUrl.Login,
        { username: this.rdi.username, password: this.rdi.password },
      );
      console.log(response, 'response');
      const accessToken = response.data.access_token;
      const decodedJwt = decode(accessToken);

      this.auth = { jwt: accessToken, exp: decodedJwt.exp };
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (e) {
      console.log(e);
      throw wrapRdiPipelineError(e);
    }
  }

  async ensureAuth(): Promise<void> {
    const expiresIn = this.auth.exp * 1_000 - Date.now();

    if (expiresIn < TOKEN_TRESHOLD) {
      await this.connect();
    }
  }

  private async pollActionStatus(actionId: string): Promise<any> {
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        throw new RdiPipelineTimeoutException();
      }

      try {
        const response = await this.client.get(`${RdiUrl.Action}/${actionId}`);
        const { status, data, error } = response.data;

        if (status === 'failed') {
          throw new RdiPipelineInternalServerErrorException(error);
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
