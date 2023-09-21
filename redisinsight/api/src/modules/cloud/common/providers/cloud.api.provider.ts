import axios from 'axios';
import { CloudRequestUtm, ICloudApiCredentials } from 'src/modules/cloud/common/models';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

export class CloudApiProvider {
  protected api = axios.create({
    baseURL: cloudConfig.apiUrl,
  });

  /**
   * Generates utm query parameters object
   * @param utm
   */
  static generateUtmQuery(utm: CloudRequestUtm): URLSearchParams {
    if (!utm) {
      return null;
    }

    const params = new URLSearchParams();

    if (utm?.source) {
      params.append('utm_source', utm.source);
    }

    if (utm?.medium) {
      params.append('utm_medium', utm.medium);
    }

    if (utm?.campaign) {
      params.append('utm_campaign', utm.campaign);
    }

    return params;
  }

  /**
   * Prepare header for authorized requests
   * @param credentials
   */
  static getHeaders(credentials: ICloudApiCredentials): { headers: {} } {
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
