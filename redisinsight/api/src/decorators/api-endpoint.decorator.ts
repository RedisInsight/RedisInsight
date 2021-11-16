import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export interface IApiEndpointOptions {
  description: string;
  statusCode?: number;
  responses?: ApiResponseOptions[];
}

export function ApiEndpoint(
  options: IApiEndpointOptions,
): MethodDecorator & ClassDecorator {
  const { description, statusCode, responses = [] } = options;
  return applyDecorators(
    ApiOperation({ description }),
    HttpCode(statusCode),
    ...responses?.map((response) => ApiResponse(response)),
  );
}
