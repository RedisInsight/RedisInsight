import { RedisString } from 'src/common/constants';

export interface IKeyInfoStrategy {
  getLengthCommandArgs(key: RedisString): unknown[]
  getLengthValue(resp): number
}
