import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CloudAuthDto } from 'src/modules/cloud/autodiscovery/dto';

const validator = new Validator();

export const cloudAuthDtoFromRequestHeadersFactory = (data: unknown, ctx: ExecutionContext): CloudAuthDto => {
  const request = ctx.switchToHttp().getRequest();

  const dto = plainToClass(CloudAuthDto, {
    apiKey: request.headers['x-cloud-api-key'],
    apiSecret: request.headers['x-cloud-api-secret'],
  });

  const errors = validator.validateSync(dto);

  if (errors?.length) {
    throw new UnauthorizedException('Required authentication credentials were not provided');
  }

  return dto;
};

export const CloudAuthHeaders = createParamDecorator(cloudAuthDtoFromRequestHeadersFactory);
