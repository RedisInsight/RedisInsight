import { Global, Module } from '@nestjs/common';
import LoggerService from 'src/modules/logger/logger.service';
import LOGGER_CONFIG from '../../../config/logger';

@Global()
@Module({
  providers: [
  {
  provide: 'LOGGER_CONFIG',
  useValue: LOGGER_CONFIG,
  },
  LoggerService,
  ],
  exports: [LoggerService],
  })
export class LoggerModule {}
