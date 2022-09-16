import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { convertStringsArrayToObject } from 'src/utils';

export class TsInfoStrategy extends AbstractInfoStrategy {
  getLengthCommandArgs(key: RedisString): unknown[] {
    return ['ts.info', [key]];
  }

  getLengthValue(resp): number {
    const { totalsamples } = convertStringsArrayToObject(resp);
    return totalsamples;
  }
}
