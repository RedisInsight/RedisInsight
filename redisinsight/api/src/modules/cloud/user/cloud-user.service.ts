import { Injectable, Logger } from '@nestjs/common';
import { SessionMetadata } from 'src/common/models';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudUser } from './cloud-user.model';

@Injectable()
export class CloudUserService {
  private logger = new Logger('CloudUserService');

  constructor(
    private readonly repository: CloudUserRepository,
  ) {}

  async get(sessionMetadata: SessionMetadata): Promise<CloudUser> {
    return this.repository.get(sessionMetadata);
  }
}
