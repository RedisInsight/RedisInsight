import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';

export class GraphInfoStrategy extends AbstractInfoStrategy {
  getLengthCommandArgs(key: RedisString): unknown[] {
    return ['graph.query', [key, 'MATCH (r) RETURN count(r)', '--compact']];
  }

  getLengthValue(resp): number {
    return resp[1][0][0][1];
  }
}
