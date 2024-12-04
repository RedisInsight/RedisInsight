import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { LoggerService as NestLoggerService } from '@nestjs/common';
import { cloneDeep } from 'lodash';

type ContextOrMetaArgs = (string | object)[];

export class LoggerService implements NestLoggerService {
  protected context?: string;

  private readonly nestLogger: ReturnType<typeof WinstonModule.createLogger>;

  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'WebSocketsController',
    'NestFactory',
  ];

  constructor(
    loggerOptions: WinstonModuleOptions,
    private readonly disableStartupLogs = false,
    context?: string,
  ) {
    console.log('logger options...', loggerOptions);
    this.nestLogger = WinstonModule.createLogger(loggerOptions);
    this.context = context;
  }

  setContext(context: string) {
    this.context = context;
  }

  formatMeta(contextOrMetaArgs: ContextOrMetaArgs) {
    const argsCopy = cloneDeep(contextOrMetaArgs);
    let context: string | null = null;
    let meta: object | null = null;

    if (typeof argsCopy[0] === 'string') {
      context = argsCopy.shift() as string;
    }
    if (typeof argsCopy[0] === 'object') {
      meta = argsCopy.shift() as object;
    }

    const localContext = context || this.context;
    if (!meta) {
      return localContext;
    }
    return {
      context: localContext,
      meta,
    };
  }

  debug(message: unknown, ...contextOrMetaArgs: ContextOrMetaArgs) {
    this.nestLogger.debug(message, this.formatMeta(contextOrMetaArgs));
  }

  log(message: unknown, context?: string, meta?: object) {
    if (
      !this.disableStartupLogs
      || !LoggerService.contextsToIgnore.includes(context)
    ) {
      this.nestLogger.log(message, this.formatMeta([context, meta]));
    }
  }

  info(message: unknown, ...contextOrMetaArgs: ContextOrMetaArgs) {
    this.nestLogger.log(message, this.formatMeta(contextOrMetaArgs));
  }

  error(
    message: unknown,
    stack?: string,
    ...contextOrMetaArgs: ContextOrMetaArgs
  ) {
    this.nestLogger.error(message, stack, this.formatMeta(contextOrMetaArgs));
  }

  fatal(
    message: unknown,
    stack?: string,
    ...contextOrMetaArgs: ContextOrMetaArgs
  ) {
    this.nestLogger.fatal(message, stack, this.formatMeta(contextOrMetaArgs));
  }

  verbose(message: unknown, ...contextOrMetaArgs: ContextOrMetaArgs) {
    this.nestLogger.verbose(message, this.formatMeta(contextOrMetaArgs));
  }

  warn(message: unknown, ...contextOrMetaArgs: ContextOrMetaArgs) {
    this.nestLogger.warn(message, this.formatMeta(contextOrMetaArgs));
  }
}

export default LoggerService;
