import { SessionMetadata } from 'src/common/models';

export enum CloudAuthIdpType {
  Google = 'google',
  Microsoft = 'microsoft',
  GitHub = 'github',
  Sso = 'sso',
}

export class CloudAuthRequestOptions {
  strategy: CloudAuthIdpType;

  action?: string;

  data?: Record<string, any>;

  callback?: Function;
}

export class CloudAuthRequest extends CloudAuthRequestOptions {
  idpType: CloudAuthIdpType;

  sessionMetadata: SessionMetadata;

  createdAt: Date;
}
