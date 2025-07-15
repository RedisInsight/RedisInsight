import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { ApiRedisString } from 'src/common/decorators/redis-string-schema.decorator';

export class KeyResponse {
  @ApiRedisString('keyName')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  keyName: RedisString;
}

export class RenameKeyResponse extends KeyResponse {}
