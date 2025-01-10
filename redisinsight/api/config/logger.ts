import { transports, format } from 'winston';
import 'winston-daily-rotate-file';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import { join } from 'path';
import config from 'src/utils/config';
import { prettyFormat, sensitiveDataFormatter } from 'src/utils/logsFormatter';

const PATH_CONFIG = config.get('dir_path');
const LOGGER_CONFIG = config.get('logger');

const transportsConfig = [];

if (LOGGER_CONFIG.stdout) {
  transportsConfig.push(
    new transports.Console({
      format: format.combine(
        sensitiveDataFormatter({ omitSensitiveData: LOGGER_CONFIG.omitSensitiveData }),
        format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('Redis Insight', {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),
  );
}

if (LOGGER_CONFIG.files) {
  transportsConfig.push(
    new transports.DailyRotateFile({
      dirname: join(PATH_CONFIG.logs),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      filename: 'redisinsight-errors-%DATE%.log',
      level: 'error',
      format: format.combine(
        sensitiveDataFormatter({ omitSensitiveData: LOGGER_CONFIG.omitSensitiveData }),
        prettyFormat,
      ),
    }),
  );
  transportsConfig.push(
    new transports.DailyRotateFile({
      dirname: join(PATH_CONFIG.logs),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      filename: 'redisinsight-%DATE%.log',
      format: format.combine(
        sensitiveDataFormatter({ omitSensitiveData: LOGGER_CONFIG.omitSensitiveData }),
        prettyFormat,
      ),
    }),
  );
}

const logger: WinstonModuleOptions = {
  format: format.errors({ stack: true }),
  transports: transportsConfig,
  level: LOGGER_CONFIG.logLevel,
};

export default logger;
