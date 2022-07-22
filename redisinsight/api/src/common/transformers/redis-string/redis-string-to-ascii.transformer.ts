import { RedisString } from 'src/common/constants';
import { getASCIISafeStringFromBuffer } from 'src/utils/cli-helper';

export const RedisStringToASCIITransformer = (value: RedisString) => {
  if (value instanceof Buffer) {
    return getASCIISafeStringFromBuffer(value);
  }

  // todo: double check. probably no need to convert utf8 to ascii
  return value;
};
