import { get } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import {
  ICloudApiAccount, ICloudApiUser,
} from 'src/modules/cloud/user/models';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';
import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudApiProvider } from 'src/modules/cloud/common/providers/cloud.api.provider';
import { inspect } from 'util';

@Injectable()
export class CloudUserApiProvider extends CloudApiProvider {
  private logger = new Logger('CloudUserApiProvider');

  /**
   * Login user to api using accessToken from oauth flow
   * returns JSESSIONID
   * @param credentials
   * @private
   */
  async getCsrfToken(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { data } = await this.api.get(
        'csrf',
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.csrfToken?.csrf_token;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Login user to api using accessToken from oauth flow
   * returns JSESSIONID
   * @param credentials
   * @param utm
   * @private
   */
  async getApiSessionId(credentials: ICloudApiCredentials, utm?: CloudRequestUtm): Promise<string> {
    try {
      this.logger.log(`Getting apiSessionId ${Object.keys(credentials || {}).toString()}`);
      this.logger.log('UTM: ', JSON.stringify(utm));
      const { headers } = await this.api.post(
        'login',
        {
          ...CloudApiProvider.generateUtmBody(utm),
          auth_mode: credentials?.idpType,
        },
        {
          ...CloudApiProvider.getHeaders(credentials),
        },
      );
      this.logger.log('headers: ', JSON.stringify(headers));
      return get(headers, 'set-cookie', []).find(
        (header) => header.indexOf('JSESSIONID=') > -1,
      )
        ?.match(/JSESSIONID=([^;]+)/)?.[1];
    } catch (e) {
      try {
        this.logger.error('Error getting apiSessionId: ', inspect(e?.response, false, 5));
      } catch (err) {
        this.logger.log('Error on logging');
      }
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Get current user profile
   * @param credentials
   */
  async getCurrentUser(credentials: ICloudApiCredentials): Promise<ICloudApiUser> {
    try {
      const { data } = await this.api.get(
        '/users/me',
        CloudApiProvider.getHeaders(credentials),
      );

      return data;
    } catch (e) {
      this.logger.error('Error when getting current user', e);
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Fetch list of user accounts
   * @param credentials
   */
  async getAccounts(credentials: ICloudApiCredentials): Promise<ICloudApiAccount[]> {
    try {
      const { data } = await this.api.get(
        '/accounts',
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.accounts;
    } catch (e) {
      this.logger.error('Error getting accounts ', e);
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Select current account to work with
   * @param credentials
   * @param accountId
   */
  async setCurrentAccount(credentials: ICloudApiCredentials, accountId: number): Promise<void> {
    try {
      await this.api.post(
        `/accounts/setcurrent/${accountId}`,
        {},
        CloudApiProvider.getHeaders(credentials),
      );
    } catch (e) {
      this.logger.error('Error setting current account', e);
      throw wrapCloudApiError(e);
    }
  }
}
