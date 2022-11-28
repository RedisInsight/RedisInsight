import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Session } from 'src/common/models';

export const sessionFromRequestFactory = (data: unknown, ctx: ExecutionContext): Session => {
  const request = ctx.switchToHttp().getRequest();

  return plainToClass(Session, request.session);
};

export const SessionFromRequest = createParamDecorator(sessionFromRequestFactory);
