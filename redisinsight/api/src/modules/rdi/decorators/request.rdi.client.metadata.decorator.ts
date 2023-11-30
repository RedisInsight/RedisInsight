import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { sessionMetadataFromRequestFactory } from 'src/common/decorators';
import { plainToClass } from 'class-transformer';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { Validator } from 'class-validator';

const validator = new Validator();

export const RequestRdiClientMetadata = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  const rdiClientMetadata = plainToClass(RdiClientMetadata, {
    id: req.params?.['id'],
    sessionMetadata: sessionMetadataFromRequestFactory(undefined, ctx),
  });

  const errors = validator.validateSync(rdiClientMetadata, {
    whitelist: false, // we need this to allow additional fields if needed for flexibility
  });

  if (errors?.length) {
    throw new BadRequestException(Object.values(errors[0].constraints) || 'Bad request');
  }

  return rdiClientMetadata;
});
