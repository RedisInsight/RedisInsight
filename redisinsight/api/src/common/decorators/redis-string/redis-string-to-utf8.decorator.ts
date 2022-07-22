import { Transform, TransformOptions } from 'class-transformer';
import { RedisStringToUTF8Transformer } from 'src/common/transformers';

export const RedisStringToUTF8 = (
  opts: TransformOptions,
) => Transform(RedisStringToUTF8Transformer, opts);
