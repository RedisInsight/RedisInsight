import { join } from 'path';
import * as os from 'os';
import { getHomedir } from 'src/config-helper';

const homedirInit = process.env.APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight'));

const prevHomedir = join(os.homedir(), '.redisinsight-preview');
const v2Homedir = join(os.homedir(), '.redisinsight-v2');
const homedir = getHomedir(homedirInit, v2Homedir);

export default {
  dir_path: {
    homedir,
    prevHomedir,
    v2Homedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    customTutorials: join(homedir, 'custom-tutorials'),
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
  analytics: {
    writeKey: process.env.SEGMENT_WRITE_KEY || 'lK5MNZgHbxj6vQwFgqZxygA0BiDQb32n',
    flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL, 10) || 10000,
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  cloud: {
    cApiUrl: process.env.RI_CLOUD_CAPI_URL || 'https://api.redislabs.com/v1',
  },
};
