import { ForbiddenException, Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CreateCloudJobDto, MonitorCloudJobDto } from 'src/modules/cloud/job/dto';
import { wrapHttpError } from 'src/common/utils';
import { CloudJobProvider } from 'src/modules/cloud/job/cloud-job.provider';
import { CloudJobInfo } from 'src/modules/cloud/job/models';
import { Socket } from 'socket.io';
import { CloudJobNotFoundException } from 'src/modules/cloud/job/exceptions';
import { CloudJobEvents } from 'src/modules/cloud/common/constants';

@Injectable()
export class CloudJobService {
  constructor(
    private readonly cloudJobProvider: CloudJobProvider,
  ) {}

  /**
   * Create cloud job
   * @param sessionMetadata
   * @param dto
   */
  async create(sessionMetadata: SessionMetadata, dto: CreateCloudJobDto): Promise<CloudJobInfo> {
    try {
      return await this.cloudJobProvider.addJob(sessionMetadata, dto);
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  async monitorJob(sessionMetadata: SessionMetadata, dto: MonitorCloudJobDto, client: Socket): Promise<CloudJobInfo> {
    const job = await this.cloudJobProvider.get(dto.jobId);

    // todo: add check for sessionMetadata
    if (!job) {
      throw new CloudJobNotFoundException();
    }

    if (job.options?.sessionMetadata?.userId !== sessionMetadata.userId) {
      throw new ForbiddenException('This job doesn\'t belong to the user');
    }

    job.addStateCallback((cloudJob) => {
      client.emit(CloudJobEvents.Monitor, cloudJob.getState());
    });

    return job.getState();
  }
}
