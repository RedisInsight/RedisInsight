import { applyDecorators } from '@nestjs/common';
import {
  AnyToRedisString, RedisStringToASCII, RedisStringToBuffer, RedisStringToUTF8,
} from 'src/common/decorators';
import { RedisStringResponseEncoding } from 'src/common/constants';

export function RedisStringType() {
  return applyDecorators(
    RedisStringToASCII({
      groups: [RedisStringResponseEncoding.ASCII],
      toPlainOnly: true,
    }),
    RedisStringToUTF8({
      groups: [RedisStringResponseEncoding.UTF8],
      toPlainOnly: true,
    }),
    RedisStringToBuffer({
      groups: [RedisStringResponseEncoding.Buffer],
      toPlainOnly: true,
    }),
    AnyToRedisString({
      toClassOnly: true,
    }),
  );
}
