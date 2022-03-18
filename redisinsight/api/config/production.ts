import { join } from 'path';
import * as os from 'os';

const homedir = process.env.APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-preview'));

export default {
  dir_path: {
    homedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    commands: join(homedir, 'commands'),
    enablementArea: process.env.GUIDES_DEV_PATH || join(homedir, 'enablement-area'),
    content: process.env.CONTENT_DEV_PATH || join(homedir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
  },
  server: {
    env: 'production',
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  redis_cloud: {
    url: process.env.REDIS_CLOUD_URL || 'https://api.redislabs.com/v1',
  },
};
