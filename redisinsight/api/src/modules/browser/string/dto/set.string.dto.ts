import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { ApiRedisString } from 'src/common/decorators/redis-string-schema.decorator';

export class SetStringDto extends KeyDto {
  @ApiRedisString('Key value')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
