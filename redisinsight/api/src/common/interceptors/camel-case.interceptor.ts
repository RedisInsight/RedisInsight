import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { camelCase, mapKeys } from 'lodash';

@Injectable()
export class CamelCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertKeysToCamelCase(data)));
  }

  convertKeysToCamelCase(data: any): any {
    if (Array.isArray(data)) {
      return data.map(this.convertKeysToCamelCase);
    }

    if (data !== null && data.constructor === Object) {
      return mapKeys(
        Object.fromEntries(
          Object.entries(data).map(([key, value]) => [camelCase(key), this.convertKeysToCamelCase(value)]),
        ),
        (value, key) => camelCase(key),
      );
    }
    return data;
  }
}
