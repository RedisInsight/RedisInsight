import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';

export class StringInfoStrategy extends AbstractInfoStrategy {
  getLengthCommandArgs(key: RedisString): unknown[] {
    return ['strlen', [key]];
  }
}
