import { Injectable } from '@nestjs/common';
import { CloudUser } from 'src/modules/cloud/user/cloud-user.model';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export abstract class CloudUserRepository {
  abstract get(sessionMetadata: SessionMetadata): Promise<CloudUser>;
}
