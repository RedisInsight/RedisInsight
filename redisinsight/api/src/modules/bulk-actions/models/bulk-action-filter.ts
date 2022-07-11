import { RedisDataType } from 'src/modules/browser/dto';
import {
  IsEnum, IsInt, IsOptional, IsString,
} from 'class-validator';

export class BulkActionFilter {
  @IsOptional()
  @IsEnum(RedisDataType)
  type?: RedisDataType = null;

  @IsOptional()
  @IsString()
  match?: string = '*';

  @IsOptional()
  @IsInt()
  count?: number = 10_000;

  /**
   * Generate scan args array for filter
   */
  getScanArgsArray(): Array<number | string> {
    const args = ['count', this.count, 'match', this.match];

    if (this.type) {
      args.push('type', this.type);
    }

    return args;
  }

  getCount(): number {
    return this.count;
  }
}
