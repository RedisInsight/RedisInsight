import { CloudJob } from 'src/modules/cloud/job/jobs';
import { SessionMetadata } from 'src/common/models';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto';
import { CloudJobInfo, CloudJobRunMode } from 'src/modules/cloud/job/models';
import { CloudJobFactory } from 'src/modules/cloud/job/cloud-job.factory';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { wrapHttpError } from 'src/common/utils';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudJobProvider {
  private jobs: Map<string, CloudJob> = new Map();

  constructor(
    private readonly cloudJobFactory: CloudJobFactory,
    private readonly cloudUserApiService: CloudUserApiService,
  ) {}

  async addJob(sessionMetadata: SessionMetadata, dto: CreateCloudJobDto): Promise<CloudJobInfo> {
    try {
      const capiCredentials = await this.cloudUserApiService.getCapiKeys(sessionMetadata);

      const job = await this.cloudJobFactory.create(
        dto.name,
        {
          capiCredentials,
        },
        {
          sessionMetadata,
        },
      );

      // tmp: clear all jobs due to current requirements (1 at time)
      if (this.jobs.size) {
        this.jobs.forEach((ongoingJob) => {
          ongoingJob.abort('Another job was added');
        });
        this.jobs.clear();
      }

      this.jobs.set(job.id, job);

      if (dto.runMode === CloudJobRunMode.Async) {
        job.run().catch(() => {});

        return job.getState();
      }

      return await job.run();
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  async get(id: string): Promise<CloudJob> {
    return this.jobs.get(id);
  }
}
