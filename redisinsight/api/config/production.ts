import { join } from 'path';

const homedir = join(require('os').homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-v2.0');

export default {
  dir_path: {
    homedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    commands: join(homedir, 'commands'),
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
    url: process.env.REDIS_CLOUD_URL || 'https://api.redislabs.com/v1/',
  },
};
