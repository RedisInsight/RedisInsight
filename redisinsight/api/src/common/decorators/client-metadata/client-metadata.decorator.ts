import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { sessionFromRequestFactory } from 'src/common/decorators';
import { API_PARAM_CLI_CLIENT_ID, API_PARAM_DATABASE_ID } from 'src/common/constants';

export interface IClientMetadataDecoratorOptions {
  paramPath?: string,
  queryPath?: string,
  bodyPath?: string,
  context?: ClientContext,
  uniqueId?: string,
}

export const clientMetadataFromRequestFactory = (options: IClientMetadataDecoratorOptions, ctx: ExecutionContext) => {
  const opts: IClientMetadataDecoratorOptions = {
    context: ClientContext.Common,
    ...options,
  };

  const request = ctx.switchToHttp().getRequest();

  let databaseId;
  if (opts.paramPath) {
    databaseId = request.params?.[opts.paramPath];
  } else if (opts.queryPath) {
    // TBD
  } else if (opts.bodyPath) {
    // TBD
  }

  // todo: add validation
  if (!databaseId) {
    // todo: define proper error
    throw new Error('No databaseId found');
  }

  return plainToClass(ClientMetadata, {
    session: sessionFromRequestFactory(undefined, ctx),
    databaseId,
    context: opts.context,
    uniqueId: opts.uniqueId,
  });
};

export const ClientMetadataFromRequest = createParamDecorator(clientMetadataFromRequestFactory);

export const browserClientMetadataFactory = (
  param = API_PARAM_DATABASE_ID,
  ctx: ExecutionContext,
): ClientMetadata => clientMetadataFromRequestFactory({
  paramPath: param,
  context: ClientContext.Browser,
}, ctx);

export const BrowserClientMetadata = createParamDecorator(browserClientMetadataFactory);

export const cliClientMetadataFactory = (
  options = { databaseParam: API_PARAM_DATABASE_ID, uuidParam: API_PARAM_CLI_CLIENT_ID },
  ctx: ExecutionContext,
): ClientMetadata => {
  const request = ctx.switchToHttp().getRequest();

  // todo: add validation
  return clientMetadataFromRequestFactory({
    paramPath: options.databaseParam,
    context: ClientContext.CLI,
    uniqueId: request.params?.[options.uuidParam],
  }, ctx);
};

export const CliClientMetadata = createParamDecorator(cliClientMetadataFactory);
