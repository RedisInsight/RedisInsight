import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { API_HEADER_WINDOW_ID } from 'src/common/constants';
import { WindowAuthService } from '../window-auth.service';
import { WindowUnauthorizedException } from '../constants/exceptions';

@Injectable()
export class WindowAuthMiddleware implements NestMiddleware {
  private logger = new Logger('WindowAuthMiddleware');
  constructor(private windowAuthService: WindowAuthService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<any> {
    console.log('[Auth Middleware] Headers:', req.headers);
    const { windowId } = WindowAuthMiddleware.getWindowIdFromReq(req);
    console.log('[Auth Middleware] Extracted window ID:', windowId);
    
    if (!windowId && req.path.startsWith('/static/')) {
      console.log('[Auth Middleware] Skipping auth for static path:', req.path);
      return next();
    }

    const isAuthorized = await this.windowAuthService.isAuthorized(windowId);
    console.log('[Auth Middleware] Authorization result:', { windowId, isAuthorized });

    if (!isAuthorized) {
      console.log('[Auth Middleware] Authorization failed for window ID:', windowId);
      this.throwError(req, ERROR_MESSAGES.UNDEFINED_WINDOW_ID);
    }

    next();
  }

  private static getWindowIdFromReq(req: Request) {
    const windowId = req?.headers?.[API_HEADER_WINDOW_ID];
    console.log('test getWindowIdFromReq', windowId)
    return { windowId: windowId ? `${windowId}` : undefined };
  }

  private throwError(req: Request, message: string) {
    const { method, url } = req;
    console.log('test throwError', req, message)
    this.logger.error(`${message} ${method} ${url}`);

    throw new WindowUnauthorizedException(message);
  }
}
