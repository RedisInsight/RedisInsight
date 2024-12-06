import { LoggerService } from 'src/modules/logger/logger.service';
import LOGGER_CONFIG from '../../config/logger';

export const mockLoggerService = new LoggerService(
  LOGGER_CONFIG,
  false,
  'mockLoggerService',
);
