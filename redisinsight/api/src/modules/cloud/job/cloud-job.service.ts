import { Injectable } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CreateCloudJobDto } from 'src/modules/cloud/job/dto';
import { wrapHttpError } from 'src/common/utils';
import { CloudJobProvider } from 'src/modules/cloud/job/cloud-job.provider';
import { CloudJobInfo } from 'src/modules/cloud/job/models';

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
}
