import { RedisDataType } from 'src/modules/browser/dto';

export interface IBulkActionFilterOverview {
  type: RedisDataType,
  match: string,
}
