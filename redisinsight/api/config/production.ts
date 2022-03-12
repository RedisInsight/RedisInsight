import { join } from 'path';

const homedir = join(require('os').homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-preview');

export default {
  dir_path: {
    homedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    commands: join(homedir, 'commands'),
    guides: process.env.GUIDES_DEV_PATH || join(homedir, 'guides'),
    tutorials: process.env.TUTORIALS_DEV_PATH || join(homedir, 'tutorials'),
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
