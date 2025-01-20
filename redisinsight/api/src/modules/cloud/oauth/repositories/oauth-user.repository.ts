import { Injectable } from '@nestjs/common';
import { CloudOauthUser } from 'src/modules/cloud/oauth/models';

@Injectable()
export abstract class OauthUserRepository {
  abstract get(userId: string): Promise<CloudOauthUser>;
  abstract update(userId: string, data: Partial<CloudOauthUser>): Promise<CloudOauthUser>;
}
