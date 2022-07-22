import { Transform, TransformOptions } from 'class-transformer';
import { RedisStringToASCIITransformer } from 'src/common/transformers';

export const RedisStringToASCII = (
  opts: TransformOptions,
) => Transform(RedisStringToASCIITransformer, opts);
