import {
  DynamicModule,
  Module,
  Scope,
} from '@nestjs/common';
import { WinstonModuleOptions } from 'nest-winston';
import { INQUIRER } from '@nestjs/core';
import { LoggerService } from './logger.service';
import LOGGER_CONFIG from '../../../config/logger';

@Module({})
export class LoggerModule {
  static register(
    loggerOptions: WinstonModuleOptions = LOGGER_CONFIG,
    disableStartupLogs = false,
  ): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerService,
          useFactory: (parentClass: object) => new LoggerService(
            loggerOptions,
            disableStartupLogs,
            parentClass?.constructor?.name,
          ),
          inject: [INQUIRER],
          scope: Scope.TRANSIENT,
        },
      ],
      exports: [LoggerService],
    };
  }
}
