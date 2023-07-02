import axios from 'axios';
import { get } from 'lodash';
import { Injectable } from '@nestjs/common';
import {
  ICloudApiAccount, ICloudApiCredentials, ICloudCApiKey, ICloudApiUser,
} from 'src/modules/cloud/user/models';
import config from 'src/utils/config';
import { wrapCloudApiError } from 'src/modules/cloud/common/exceptions';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudUserApiService {
  private apiClient = axios.create({
    baseURL: cloudConfig.apiUrl,
  });

  /**
   * Prepare header for authorized requests
   * @param credentials
   */
  static getApiHeaders(credentials: ICloudApiCredentials) {
    const headers = {};

    if (credentials?.accessToken) {
      headers['authorization'] = `Bearer ${credentials.accessToken}`;
    }

    if (credentials?.apiSessionId) {
      headers['cookie'] = `JSESSIONID=${credentials.apiSessionId}`;
    }

    if (credentials?.csrf) {
      headers['x-csrf-token'] = credentials.csrf;
    }

    return {
      headers,
    };
  }

  /**
   * Login user to api using accessToken from oauth flow
   * returns JSESSIONID
   * @param credentials
   * @private
   */
  async getCsrfToken(credentials: ICloudApiCredentials): Promise<string> {
    try {
      const { data } = await this.apiClient.get(
        'csrf',
        CloudUserApiService.getApiHeaders(credentials),
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
      const { headers } = await this.apiClient.post(
        'login',
        {},
        CloudUserApiService.getApiHeaders(credentials),
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
      const { data } = await this.apiClient.get(
        '/users/me',
        CloudUserApiService.getApiHeaders(credentials),
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
      const { data } = await this.apiClient.get(
        '/accounts',
        CloudUserApiService.getApiHeaders(credentials),
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
      await this.apiClient.post(
        `/accounts/setcurrent/${accountId}`,
        {},
        CloudUserApiService.getApiHeaders(credentials),
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
      await this.apiClient.delete(
        `/accounts/cloud-api/cloudApiKeys/${id}`,
        CloudUserApiService.getApiHeaders(credentials),
      );
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }

  /**
   * Get list of CApi keys
   * @param credentials
   */
  async getCApiKeys(credentials: ICloudApiCredentials): Promise<ICloudCApiKey[]> {
    try {
      const { data } = await this.apiClient.get(
        '/accounts/cloud-api/cloudApiKeys',
        CloudUserApiService.getApiHeaders(credentials),
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
  async createCApiKey(credentials: ICloudApiCredentials, accountId: number): Promise<ICloudCApiKey> {
    try {
      const { data } = await this.apiClient.post(
        '/accounts/cloud-api/cloudApiKeys',
        {
          cloudApiKey: {
            name: cloudConfig.cloudApiKeyName,
            user_account: accountId,
            ip_whitelist: [],
          },
        },
        CloudUserApiService.getApiHeaders(credentials),
      );

      return data?.cloudApiKey;
    } catch (e) {
      throw wrapCloudApiError(e);
    }
  }
}
