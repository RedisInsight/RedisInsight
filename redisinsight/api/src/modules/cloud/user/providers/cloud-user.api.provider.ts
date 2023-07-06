import { get } from 'lodash';
import { Injectable } from '@nestjs/common';
import {
  ICloudApiAccount, ICloudApiCapiKey, ICloudApiUser,
} from 'src/modules/cloud/user/models';
import config from 'src/utils/config';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';
import { ICloudApiCredentials } from 'src/modules/cloud/common/models';
import { CloudApiProvider } from 'src/modules/cloud/common/providers/cloud.api.provider';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudUserApiProvider extends CloudApiProvider {
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
   * @private
   */
  async getApiSessionId(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { headers } = await this.api.post(
        'login',
        {},
        CloudApiProvider.getHeaders(credentials),
      );

      return get(headers, 'set-cookie', []).find(
        (header) => header.indexOf('JSESSIONID=') > -1,
      )
        ?.match(/JSESSIONID=(\w+)/)?.[1];
    } catch (e) {
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
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Delete CApi key from current account
   * @param credentials
   * @param id
   */
  async deleteCApiKeys(credentials: ICloudApiCredentials, id: number): Promise<void> {
    try {
      await this.api.delete(
        `/accounts/cloud-api/cloudApiKeys/${id}`,
        CloudApiProvider.getHeaders(credentials),
      );
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Get list of CApi keys
   * @param credentials
   */
  async enableCapi(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { data } = await this.api.post(
        '/accounts/cloud-api/cloudApiAccessKey',
        {},
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.cloudApiAccessKey?.accessKey;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Get list of CApi keys
   * @param credentials
   */
  async getCapiKeys(credentials: ICloudApiCredentials): Promise<ICloudApiCapiKey[]> {
    try {
      const { data } = await this.api.get(
        '/accounts/cloud-api/cloudApiKeys',
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.cloudApiKeys;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Create new CApi key
   * @param credentials
   * @param accountId
   */
  async createCapiKey(credentials: ICloudApiCredentials, accountId: number): Promise<ICloudApiCapiKey> {
    try {
      const { data } = await this.api.post(
        '/accounts/cloud-api/cloudApiKeys',
        {
          cloudApiKey: {
            name: cloudConfig.capiKeyName,
            user_account: accountId,
            ip_whitelist: [],
          },
        },
        CloudApiProvider.getHeaders(credentials),
      );

      return data?.cloudApiKey;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }
}
