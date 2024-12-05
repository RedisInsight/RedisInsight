import { Injectable } from '@nestjs/common';
import { CloudTaskCapiProvider } from 'src/modules/cloud/task/providers/cloud-task.capi.provider';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { parseCloudTaskCapiResponse } from 'src/modules/cloud/task/utils';
import { CloudTask } from 'src/modules/cloud/task/models';
import { CloudTaskNotFoundException } from 'src/modules/cloud/job/exceptions';
import LoggerService from 'src/modules/logger/logger.service';

@Injectable({})
export class CloudTaskCapiService {
  constructor(
    private logger: LoggerService,
    private readonly cloudTaskCapiProvider: CloudTaskCapiProvider,
  ) {}

  async getTask(credentials: CloudCapiAuthDto, id: string): Promise<CloudTask> {
    try {
      this.logger.debug('Trying to get cloud task', { id });
      const task = await this.cloudTaskCapiProvider.getTask(credentials, id);

      if (!task) {
        throw new CloudTaskNotFoundException();
      }

      this.logger.debug('Successfully fetched cloud task', task);
      return parseCloudTaskCapiResponse(task);
    } catch (e) {
      this.logger.error('Unable to get cloud task', e);
      throw wrapHttpError(e);
    }
  }
}
