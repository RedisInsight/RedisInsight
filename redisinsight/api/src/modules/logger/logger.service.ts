import { WinstonModule } from 'nest-winston';
import { ConsoleLogger } from '@nestjs/common';

import loggerConfig from '../../../config/logger';

class LoggerService extends ConsoleLogger {
  private readonly nestLogger: ReturnType<typeof WinstonModule.createLogger>;

  private readonly disableStartupLogs: boolean;

  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'WebSocketsController',
    'NestFactory',
  ];

  constructor() {
    super();
    this.nestLogger = WinstonModule.createLogger(loggerConfig);
    this.disableStartupLogs = false;
  }

  formatContext(context?: string, meta?: object) {
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
  log(message: unknown, ...rest: (string | object)[]) {
    const context: string =
      typeof rest[0] === 'string'
        ? (rest[0] as string)
        : (rest[1] as string) || this.context;
    const meta: object | undefined =
      typeof rest[0] === 'object' ? (rest[0] as object) : undefined;
    console.log('REST', rest);
    console.log(context);
    console.log(meta);

    if (
      !this.disableStartupLogs ||
      !LoggerService.contextsToIgnore.includes(context)
    ) {
      this.nestLogger.log(message, this.formatContext(context, meta));
    }
  }

  error(message: unknown, stack?: string, context?: string) {
    this.nestLogger.error(message, stack, context);
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
