import { Injectable, NestMiddleware } from '@nestjs/common';
import * as JSONBigInt from 'json-bigint';

@Injectable()
export class JSONBigIntSerializationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    res.json = (body: any) => {
      try {
        const jsonString = JSONBigInt.stringify(body);
        return res.send(jsonString);
      } catch (e) {
        const jsonString = JSON.stringify(body);
        return res.send(jsonString);
      }
    };

    next();
  }
}
