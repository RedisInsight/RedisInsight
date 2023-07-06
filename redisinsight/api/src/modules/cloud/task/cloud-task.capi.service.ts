import { Injectable, Logger } from '@nestjs/common';
import { CloudTaskCapiProvider } from 'src/modules/cloud/task/providers/cloud-task.capi.provider';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { parseCloudTaskCapiResponse } from 'src/modules/cloud/task/utils';
import { CloudTask } from 'src/modules/cloud/task/models';

@Injectable({})
export class CloudTaskCapiService {
  private logger = new Logger('CloudTaskCapiService');

  constructor(
    private readonly cloudTaskCapiProvider: CloudTaskCapiProvider,
  ) {}

  async getTask(credentials: CloudCapiAuthDto, id: string): Promise<CloudTask> {
    try {
      this.logger.debug('Trying to get cloud task', { id });
      const task = await this.cloudTaskCapiProvider.getTask(credentials, id);

      this.logger.debug('Successfully fetched cloud task', task);
      return parseCloudTaskCapiResponse(task);
    } catch (e) {
      this.logger.error('Unable to get cloud task', e);
      throw wrapHttpError(e);
    }
  }
}
