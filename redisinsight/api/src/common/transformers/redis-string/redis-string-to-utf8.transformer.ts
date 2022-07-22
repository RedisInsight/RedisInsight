import { RedisString } from 'src/common/constants';

export const RedisStringToUTF8Transformer = (value: RedisString) => {
  if (value instanceof Buffer) {
    return value.toString('utf8');
  }

  return value;
};
