import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { Inject, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
class LoggerService {
  protected context?: string;

  private readonly nestLogger: ReturnType<typeof WinstonModule.createLogger>;

  private readonly disableStartupLogs: boolean;

  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'WebSocketsController',
    'NestFactory',
  ];

  constructor(@Inject('LOGGER_CONFIG') loggerOptions: WinstonModuleOptions) {
    console.log('logger options...', loggerOptions);
    this.nestLogger = WinstonModule.createLogger(loggerOptions);
    this.disableStartupLogs = false;
  }

  setContext(context: string) {
    this.context = context;
  }

  formatMeta(meta?: object) {
    const { context } = this;
    if (meta === undefined) {
      return context;
    }
    const fullContext = {
      context,
      ...(meta ? { meta } : {}),
    };

    return JSON.stringify(fullContext);
  }

  debug(message: unknown, context?: string) {
    this.nestLogger.debug(message, context);
  }

  // meta?: object, context?: string
  log(message: unknown, context?: string) {
    if (
      !this.disableStartupLogs
      || !LoggerService.contextsToIgnore.includes(context)
    ) {
      this.nestLogger.log(message, context);
    }
  }

  info(message: unknown, meta?: object) {
    this.nestLogger.log(message, this.formatMeta(meta));
  }

  error(message: unknown, stack?: string) {
    this.nestLogger.error(message, stack);
  }

  fatal(message: unknown, stack?: string, context?: string) {
    this.nestLogger.fatal(message, stack, context);
  }

  verbose(message: unknown, context?: string) {
    this.nestLogger.verbose(message, context);
  }

  warn(message: unknown, context?: string) {
    this.nestLogger.warn(message, context);
  }
}

export default LoggerService;
