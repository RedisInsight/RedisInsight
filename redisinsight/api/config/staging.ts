import { join } from 'path';
import * as os from 'os';
import { getHomedir } from 'src/config-helper';

const homedirInit = process.env.APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-stage'));

const prevHomedir = join(os.homedir(), '.redisinsight-v2.0-stage');
const v2Homedir = join(os.homedir(), '.redisinsight-v2-stage');
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
    env: 'staging',
  },
  analytics: {
    writeKey: process.env.SEGMENT_WRITE_KEY || 'Ba1YuGnxzsQN9zjqTSvzPc6f3AvmH1mj',
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  logger: {
    stdout: process.env.STDOUT_LOGGER ? process.env.STDOUT_LOGGER === 'true' : true, // enabled by default
    omitSensitiveData: process.env.LOGGER_OMIT_DATA ? process.env.LOGGER_OMIT_DATA === 'true' : false,
  },
};
