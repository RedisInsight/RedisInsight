import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Session } from 'src/common/models';

const validator = new Validator();

export const sessionFromRequestFactory = (data: unknown, ctx: ExecutionContext): Session => {
  const request = ctx.switchToHttp().getRequest();

  const session = plainToClass(Session, request.session);

  const errors = validator.validateSync(session, {
    whitelist: false, // we need this to allow additional fields if needed for flexibility
  });

  if (errors?.length) {
    throw new BadRequestException(Object.values(errors[0].constraints) || 'Bad request');
  }

  return session;
};

export const SessionFromRequest = createParamDecorator(sessionFromRequestFactory);
