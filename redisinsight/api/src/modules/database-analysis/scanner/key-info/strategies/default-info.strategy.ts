import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';

export class DefaultInfoStrategy extends AbstractInfoStrategy {
  getLengthCommandArgs(key: RedisString): unknown[] {
    // todo: clarify how to do it for rejson
    return ['memory', ['usage', key, 'samples', '0']];
  }
}
