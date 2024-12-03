import { Global, Module } from '@nestjs/common';
import LoggerService from 'src/modules/logger/logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
  })
export class LoggerModule {}
