import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Validator } from 'class-validator';
import { Request } from 'express';
import { SessionMetadata } from 'src/common/models';
import { omit } from 'lodash';

const validator = new Validator();

export const sessionMetadataFromRequest = (request: Request): SessionMetadata => {
  const userId = request.res?.locals?.session?.data?.userId.toString();
  const sessionId = request.res?.locals?.session?.data?.sessionId.toString();
  const data = omit(request.res?.locals?.session?.data, ['userId', 'accountId', 'sessionId', 'correlationId']);
  const correlationId = request.res?.locals?.session?.correlationId || uuidv4();

  const requestSession = {
    userId,
    data,
    sessionId,
    correlationId,
  };

  // todo: do not forget to deal with session vs sessionMetadata property
  const session = plainToClass(SessionMetadata, requestSession);

  const errors = validator.validateSync(session, {
    whitelist: false, // we need this to allow additional fields if needed for flexibility
  });

  if (errors?.length) {
    throw new BadRequestException(Object.values(errors[0].constraints) || 'Bad request');
  }

  return session;
};

export const sessionMetadataFromRequestExecutionContext = (_: unknown, ctx: ExecutionContext): SessionMetadata => {
  const request = ctx.switchToHttp().getRequest();

  return sessionMetadataFromRequest(request);
};

export const RequestSessionMetadata = createParamDecorator(sessionMetadataFromRequestExecutionContext);
