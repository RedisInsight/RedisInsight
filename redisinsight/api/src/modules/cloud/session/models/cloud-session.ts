import { CloudUser } from 'src/modules/cloud/user/models';

export class CloudSession {
  accessToken?: string;

  csrf?: string;

  apiSessionId?: string;

  user?: CloudUser;
}
