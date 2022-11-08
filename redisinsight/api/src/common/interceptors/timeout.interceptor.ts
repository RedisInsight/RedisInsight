import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import config from 'src/utils/config';

const serverConfig = config.get('server');

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private logger = new Logger('TimeoutInterceptor');

  private readonly message: string;

  constructor(message?: string) {
    this.message = message;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(serverConfig.requestTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const { method, url } = context.switchToHttp().getRequest();
          this.logger.error(`Request Timeout. ${method} ${url}`);
          return throwError(() => new BadGatewayException(this.message));
        }
        return throwError(() => err);
      }),
    );
  }
}
