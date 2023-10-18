import { RdiJob, RdiPipeline, RdiType } from 'src/modules/rdi/models';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { AxiosInstance } from 'axios';

export class ApiRdiClient extends RdiClient {
  public type = RdiType.API;

  protected readonly client: AxiosInstance;

  async isConnected(): Promise<boolean> {
    // todo: check if needed and possible
    return true;
  }

  async getSchema(): Promise<object> {
    return {};
  }

  async getPipeline(): Promise<RdiPipeline> {
    return null;
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
