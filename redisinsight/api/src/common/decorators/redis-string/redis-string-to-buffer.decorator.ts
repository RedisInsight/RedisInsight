import { Transform, TransformOptions } from 'class-transformer';
import { RedisStringToBufferTransformer } from 'src/common/transformers';

export const RedisStringToBuffer = (
  opts: TransformOptions,
) => Transform(RedisStringToBufferTransformer, opts);
