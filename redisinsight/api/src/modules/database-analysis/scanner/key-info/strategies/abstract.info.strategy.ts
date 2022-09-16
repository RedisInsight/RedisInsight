import { RedisString } from 'src/common/constants';
import { IKeyInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/key-info.strategy.interface';

export abstract class AbstractInfoStrategy implements IKeyInfoStrategy {
  abstract getLengthCommandArgs(key: RedisString): unknown[];

  getLengthValue(resp): number {
    return resp;
  }
}
