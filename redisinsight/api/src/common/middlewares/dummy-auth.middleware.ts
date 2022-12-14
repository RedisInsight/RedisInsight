import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ISession } from 'src/common/models/session';

@Injectable()
export class DummyAuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<any> {
    req['session'] = <ISession>Object.freeze({
      userId: '1',
      sessionId: '1',
    });

    next();
  }
}
