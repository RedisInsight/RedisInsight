import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { sessionFromRequestFactory } from 'src/common/decorators';
import { Validator } from 'class-validator';
import { API_PARAM_DATABASE_ID } from 'src/common/constants';

const validator = new Validator();

export interface IClientMetadataParamOptions {
  databaseIdParam?: string,
  uniqueIdParam?: string,
  context?: ClientContext,
}

export const clientMetadataParamFactory = (
  options: IClientMetadataParamOptions,
  ctx: ExecutionContext,
): ClientMetadata => {
  const opts: IClientMetadataParamOptions = {
    context: ClientContext.Common,
    databaseIdParam: API_PARAM_DATABASE_ID,
    ...options,
  };

  const req = ctx.switchToHttp().getRequest();

  let databaseId;
  if (opts?.databaseIdParam) {
    databaseId = req.params?.[opts.databaseIdParam];
  }

  let uniqueId;
  if (opts?.uniqueIdParam) {
    uniqueId = req.params?.[opts.uniqueIdParam];
  }

  const clientMetadata = plainToClass(ClientMetadata, {
    session: sessionFromRequestFactory(undefined, ctx),
    databaseId,
    uniqueId,
    context: opts?.context || ClientContext.Common,
  });

  const errors = validator.validateSync(clientMetadata, {
    whitelist: false, // we need this to allow additional fields if needed for flexibility
  });

  if (errors?.length) {
    throw new BadRequestException(Object.values(errors[0].constraints) || 'Bad request');
  }

  return clientMetadata;
};

export const ClientMetadataParam = createParamDecorator(clientMetadataParamFactory);
