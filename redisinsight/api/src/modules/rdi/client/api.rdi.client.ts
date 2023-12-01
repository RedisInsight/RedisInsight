import { RdiJob, RdiPipeline, RdiType } from 'src/modules/rdi/models';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { RdiUrl } from 'src/modules/rdi/constants';
import { AxiosInstance } from 'axios';

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

  async deploy(pipeline: RdiPipeline): Promise<RdiPipeline> {
    return null;
  }

  async deployJob(job: RdiJob): Promise<RdiJob> {
    return null;
  }

  async disconnect(): Promise<void> {
    return undefined;
  }
}
