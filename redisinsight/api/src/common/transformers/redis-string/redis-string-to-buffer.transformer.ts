import { RedisString } from 'src/common/constants';

export const RedisStringToBufferTransformer = (value: RedisString) => {
  if (value instanceof Buffer) {
    return value;
  }

  return Buffer.from(value);
};
