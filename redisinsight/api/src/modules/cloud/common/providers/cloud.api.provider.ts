import axios from 'axios';
import {
  CloudRequestUtm,
  ICloudApiCredentials,
} from 'src/modules/cloud/common/models';
import config, { Config } from 'src/utils/config';

const serverConfig = config.get('server') as Config['server'];
const cloudConfig = config.get('cloud');

export class CloudApiProvider {
  protected api = axios.create({
    baseURL: cloudConfig.apiUrl,
  });

  /**
   * Generates utm query parameters object
   * @param utm
   */
  static generateUtmBody(utm: CloudRequestUtm): Record<string, string> {
    return {
      utm_source: utm?.source,
      utm_medium: utm?.medium,
      utm_campaign: utm?.campaign,
    };
  }

  /**
   * Prepare header for authorized requests
   * @param credentials
   */
  static getHeaders(credentials: ICloudApiCredentials): { headers: {} } {
    const headers = {
      'User-Agent': `RedisInsight/${serverConfig.version}`,
      'x-redisinsight-token': cloudConfig.apiToken,
    };

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
