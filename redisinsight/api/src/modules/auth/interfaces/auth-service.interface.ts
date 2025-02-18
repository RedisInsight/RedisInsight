import { SessionMetadata } from 'src/common/models';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';

export interface AuthRequestOptions {
  strategy: CloudAuthIdpType;
  state: string;
  client_info?: string;
  callback?: Function;
  action?: string;
}

export interface AuthQuery {
  state: string;
  code: string;
  error?: string;
  error_description?: string;
  from?: CloudSsoFeatureStrategy;
}

export interface IAuthService {
  getAuthorizationUrl(
    sessionMetadata: SessionMetadata,
    options?: AuthRequestOptions
  ): Promise<string>;

  handleCallback(query: AuthQuery, from?: CloudSsoFeatureStrategy): Promise<any>;

  isRequestInProgress(query: AuthQuery): boolean;

  finishInProgressRequest(query: AuthQuery): void;

  logout(sessionMetadata: SessionMetadata): Promise<void>;

  renewTokens?(sessionMetadata: SessionMetadata, idpType: CloudAuthIdpType, refreshToken: string): Promise<void>;
}