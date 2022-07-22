import { Transform, TransformOptions } from 'class-transformer';
import { AnyToRedisStringTransformer } from 'src/common/transformers';

export const AnyToRedisString = (
  opts: TransformOptions,
) => Transform(AnyToRedisStringTransformer, opts);
