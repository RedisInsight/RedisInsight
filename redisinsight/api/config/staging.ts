import { join } from 'path';
import * as os from 'os';

const homedir = process.env.RI_APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redisinsight-app-stage'));

const prevHomedir = join(os.homedir(), '.redisinsight-v2-stage');

export default {
  dir_path: {
    homedir,
    prevHomedir,
    logs: join(homedir, 'logs'),
    customPlugins: join(homedir, 'plugins'),
    customTutorials: join(homedir, 'custom-tutorials'),
    commands: join(homedir, 'commands'),
    guides: process.env.RI_GUIDES_PATH || join(homedir, 'guides'),
    tutorials: process.env.RI_TUTORIALS_PATH || join(homedir, 'tutorials'),
    content: process.env.RI_CONTENT_PATH || join(homedir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
  },
  server: {
    env: 'staging',
  },
  analytics: {
    writeKey: process.env.RI_SEGMENT_WRITE_KEY || 'Ba1YuGnxzsQN9zjqTSvzPc6f3AvmH1mj',
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  logger: {
    stdout: process.env.RI_STDOUT_LOGGER ? process.env.RI_STDOUT_LOGGER === 'true' : true, // enabled by default
    omitSensitiveData: process.env.RI_LOGGER_OMIT_DATA ? process.env.RI_LOGGER_OMIT_DATA === 'true' : false,
  },
};
