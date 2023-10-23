import { RedisDataType } from 'src/modules/browser/keys/keys.dto';

export interface IBulkActionFilterOverview {
  type: RedisDataType,
  match: string,
}
