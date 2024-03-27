import { CloudUser } from 'src/modules/cloud/user/models';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';

export class CloudSession {
  accessToken?: string;

  refreshToken?: string;

  idpType?: CloudAuthIdpType;

  csrf?: string;

  apiSessionId?: string;

  user?: CloudUser;
}
