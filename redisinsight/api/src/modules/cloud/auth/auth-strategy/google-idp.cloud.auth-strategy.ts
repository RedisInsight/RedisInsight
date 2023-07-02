import { SimpleStorage } from '@okta/okta-auth-js';
import config from 'src/utils/config';
import { CloudAuthStrategy } from 'src/modules/cloud/auth/auth-strategy/cloud-auth.strategy';
import { CloudAuthIdpType } from 'src/modules/cloud/auth/models/cloud-auth-request';
import { CloudSsoFeatureFlag } from 'src/modules/cloud/cloud-sso.feature.flag';

const { idp: { google: idpConfig } } = config.get('cloud');

export class GoogleIdpCloudAuthStrategy extends CloudAuthStrategy {
  constructor() {
    super();

    this.config = {
      idpType: CloudAuthIdpType.Google,
      authorizeUrl: idpConfig.authorizeUrl,
      tokenUrl: idpConfig.tokenUrl,
      issuer: idpConfig.issuer,
      clientId: idpConfig.clientId,
      pkce: true,
      redirectUri: CloudSsoFeatureFlag.getWebEndpoint(idpConfig.redirectUri),
      idp: idpConfig.idp,
      scopes: ['openid', 'email', 'profile'],
      responseMode: 'query',
      responseType: 'code',
      tokenManager: {
        storage: {} as SimpleStorage,
      },
    };
  }
}
