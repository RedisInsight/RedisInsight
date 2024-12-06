import { LoggerService } from 'src/modules/logger/logger.service';
import LOGGER_CONFIG from '../../config/logger';

export const mockLoggerServiceFactory = jest.fn(() => new LoggerService(
  LOGGER_CONFIG,
  false,
  'mockLoggerService',
));
