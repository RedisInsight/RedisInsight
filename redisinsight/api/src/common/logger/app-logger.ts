import { LoggerService, Injectable } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';

type LogMeta = object;

type LogObject = {
  [key: string]: unknown;
};

type ErrorOrMeta = Error | LogMeta | string;

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: ReturnType<typeof WinstonModule.createLogger>;

  static startupContexts = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'WebSocketsController',
    'NestFactory',
  ];

  constructor(loggerConfig: WinstonModuleOptions) {
    this.logger = WinstonModule.createLogger(loggerConfig);
  }

  private isException(error?: unknown) {
    return !!(
      error instanceof Error
      || ((error as Error)?.stack && (error as Error)?.message)
    );
  }

  private parseLoggerArgs(
    message: string | LogObject,
    optionalParams: ErrorOrMeta[],
    isErrorLevel = false,
  ) {
    const messageObj: LogObject = (
      typeof message === 'object' ? message : { message }
    ) as LogObject;
    const meta = [];
    let errorMessage: string;
    let errorStack: string;

    // nest passes the logger context as the last argument
    const contextArg = optionalParams?.[optionalParams.length - 1];

    // the global exception filter converts the error object to strings
    if (
      isErrorLevel
      && typeof optionalParams[0] === 'string'
      && optionalParams.length > 1
    ) {
      errorStack = optionalParams.shift() as string;
    }

    for (const k in optionalParams) {
      if (this.isException(optionalParams[k])) {
        errorMessage = (optionalParams[k] as Error).message;
        errorStack = (optionalParams[k] as Error).stack;
      } else if (optionalParams[k] !== contextArg) {
        meta.push(optionalParams[k]);
      }
    }
    const metaObj = meta.length > 1 ? meta : meta[0];

    return {
      context: contextArg && typeof contextArg === 'string' ? contextArg : null,
      ...metaObj,
      ...(messageObj || {}),
      ...(errorMessage || errorStack
        ? {
          error: errorMessage,
          stack: [errorStack],
        }
        : {}),
    };
  }

  /**
   * Write a 'log' level log.
   */
  log(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    const parsedArgs = this.parseLoggerArgs(message, optionalParams);
    if (!AppLogger.startupContexts.includes(parsedArgs.context)) {
      this.logger.log(parsedArgs);
    }
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    this.logger.fatal(this.parseLoggerArgs(message, optionalParams, true));
  }

  /**
   * Write an 'error' level log.
   */
  error(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    this.logger.error(this.parseLoggerArgs(message, optionalParams, true));
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    this.logger.warn(this.parseLoggerArgs(message, optionalParams, true));
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    this.logger.debug(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: string | LogObject, ...optionalParams: ErrorOrMeta[]) {
    this.logger.verbose(this.parseLoggerArgs(message, optionalParams));
  }
}
