import { join } from 'path';
import * as os from 'os';

const homedir = process.env.APP_FOLDER_ABSOLUTE_PATH
  || (join(os.homedir(), process.env.APP_FOLDER_NAME || '.redisinsight-v2.0-stage'));

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
    env: 'staging',
  },
  db: {
    database: join(homedir, 'redisinsight.db'),
  },
  logger: {
    stdout: process.env.STDOUT_LOGGER ? process.env.STDOUT_LOGGER === 'true' : true, // enabled by default
    omitSensitiveData: process.env.LOGGER_OMIT_DATA ? process.env.LOGGER_OMIT_DATA === 'true' : false,
  },
};
