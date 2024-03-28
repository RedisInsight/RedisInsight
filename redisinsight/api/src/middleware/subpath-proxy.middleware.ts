import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export default class SubpathProxyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const originalSendFile = res.sendFile;
    const proxyPath = process.env.RI_PROXY_PATH || '';
    res.sendFile = function (this: Response, path: string, options: any, callback?: (err?: Error) => void) {
      if (path.endsWith('.html')) {
        let content = fs.readFileSync(path, 'utf8');
        const regex = /{{ RIPROXYPATH }}/g;
        content = content.replace(regex, proxyPath);
        res.send(content);
        return;
      }
      originalSendFile.call(this, path, options, callback);
    };

    next();
  }
}
