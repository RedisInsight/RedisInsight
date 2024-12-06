import { WinstonModule, WinstonModuleOptions } from 'nest-winston';

type LogMeta = object;

type LogObject = {
  [key: string]: unknown
};

type ErrorOrMeta = Error | LogMeta;

export class LoggerService {
  protected context?: string;

  private readonly nestLogger: ReturnType<typeof WinstonModule.createLogger>;

  static startupContexts = [
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
    this.nestLogger = WinstonModule.createLogger(loggerOptions);
    this.context = context;
  }

  private isException(error?: unknown) {
    return (
      error instanceof Error
      || ((error as Error)?.stack && (error as Error)?.message)
    );
  }

  private formatLog(message: string | LogObject, meta?: LogMeta, error?: Error) {
    const messageObj: LogObject = (typeof message === 'string' ? { message } : message) as LogObject;

    messageObj.context = this.context;
    return {
      context: this.context,
      stack: error && error.stack,
      message: {
        ...(typeof meta === 'object' ? meta : {}),
        ...(messageObj || {}),
        ...(error ? { error: error.message } : {}),
      },
    };
  }

  private parseErrorOrMeta(errorOrMeta: ErrorOrMeta[]) {
    let error: Error;
    let meta: LogMeta;
    if (this.isException(errorOrMeta[0])) {
      error = errorOrMeta.shift() as Error;
    }
    if (errorOrMeta[0]) {
      meta = errorOrMeta.shift() as LogMeta;
    }
    return { error, meta };
  }

  debug(message: string | LogObject, meta?: LogMeta) {
    const { message: formattedMessage } = this.formatLog(message, meta);
    this.nestLogger.debug(formattedMessage);
  }

  // reserved for Nest.js
  log(message: unknown, context?: string) {
    if (
      !this.disableStartupLogs
      || !LoggerService.startupContexts.includes(context)
    ) {
      this.nestLogger.log(message, context || this.context);
    }
  }

  info(message: string | LogObject, meta?: LogMeta) {
    const { message: formattedMessage } = this.formatLog(message, meta);
    this.nestLogger.log(formattedMessage);
  }

  error(message: string | LogObject, ...errorOrMeta: ErrorOrMeta[]) {
    const { error, meta } = this.parseErrorOrMeta(errorOrMeta);
    const data = this.formatLog(message, meta, error);
    this.nestLogger.error(
      data.message,
      data.stack,
    );
  }

  fatal(message: string | LogObject, ...errorOrMeta: ErrorOrMeta[]) {
    const { error, meta } = this.parseErrorOrMeta(errorOrMeta);
    const data = this.formatLog(message, meta, error);
    this.nestLogger.fatal(
      data.message,
      data.stack,
    );
  }

  verbose(message: string | LogObject, meta?: LogMeta) {
    const { message: formattedMessage } = this.formatLog(message, meta);
    this.nestLogger.verbose(formattedMessage);
  }

  warn(message: string | LogObject, ...errorOrMeta: ErrorOrMeta[]) {
    const { error, meta } = this.parseErrorOrMeta(errorOrMeta);
    const data = this.formatLog(message, meta, error);
    this.nestLogger.warn(
      data.message,
      data.stack,
    );
  }
}
