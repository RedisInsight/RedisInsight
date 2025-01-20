import { CloudOauthUser } from 'src/modules/cloud/oauth/models';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';
import { Expose, Type } from 'class-transformer';

export class CloudSession {
  @Expose()
  accessToken?: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  idpType?: CloudAuthIdpType;

  @Expose()
  csrf?: string;

  @Expose()
  apiSessionId?: string;

  @Expose()
  user?: CloudOauthUser;
}

export class CloudSessionData {
  @Expose()
  id: number;

  @Expose()
  @Type(() => CloudSession)
  data: CloudSession;
}
