import axios from 'axios';
import { ICloudApiCredentials } from 'src/modules/cloud/common/models';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

export class CloudApiProvider {
  protected api = axios.create({
    baseURL: cloudConfig.apiUrl,
  });

  /**
   * Prepare header for authorized requests
   * @param credentials
   */
  static getHeaders(credentials: ICloudApiCredentials) {
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
}
