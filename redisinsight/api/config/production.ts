import { join } from 'path';
import * as os from 'os';

const homedir = process.env.RI_APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redis-insight'));

const prevHomedir = join(os.homedir(), '.redisinsight-app');

export default {
  dir_path: {
    homedir,
    prevHomedir,
    logs: join(homedir, 'logs'),
    customConfig: join(homedir, 'config.json'),
    customPlugins: join(homedir, 'plugins'),
    customTutorials: join(homedir, 'custom-tutorials'),
    commands: join(homedir, 'commands'),
    tutorials: process.env.RI_TUTORIALS_PATH || join(homedir, 'tutorials'),
    content: process.env.RI_CONTENT_PATH || join(homedir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
    oldFolders: [
      join(os.homedir(), '.redisinsight-preview'),
      join(os.homedir(), '.redisinsight-v2'),
      process.env.RI_GUIDES_PATH || join(homedir, 'guides'),
    ],
  },
  server: {
    env: 'production',
  },
  analytics: {
    writeKey: process.env.RI_SEGMENT_WRITE_KEY || 'lK5MNZgHbxj6vQwFgqZxygA0BiDQb32n',
    flushInterval: parseInt(process.env.RI_ANALYTICS_FLUSH_INTERVAL, 10) || 10000,
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  cloud: {
    cApiUrl: process.env.RI_CLOUD_CAPI_URL || 'https://api.redislabs.com/v1',
  },
  ai: {
    socketUrl: process.env.RI_AI_SOCKET_URL || 'https://app.redislabs.com',
    socketPath: process.env.RI_AI_SOCKET_PATH || '/api/v1/cloud-copilot-service/socket.io/',
  },
};
