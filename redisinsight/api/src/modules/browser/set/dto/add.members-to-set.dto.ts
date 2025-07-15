import { KeyDto } from 'src/modules/browser/keys/dto';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { ApiRedisString } from 'src/common/decorators/redis-string-schema.decorator';

export class AddMembersToSetDto extends KeyDto {
  @ApiRedisString('Set members', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  members: RedisString[];
}
