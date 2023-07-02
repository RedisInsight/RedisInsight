import { SessionMetadata } from 'src/common/models';

export enum CloudAuthIdpType {
  Google = 'google',
  GitHub = 'github',
}

export class CloudAuthRequest {
  idpType: CloudAuthIdpType;

  sessionMetadata: SessionMetadata;

  callback?: Function;

  createdAt: Date;
}
