import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import {
  IsRedisString,
  isZSetScore,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { ApiRedisString } from 'src/common/decorators/redis-string-schema.decorator';

export class ZSetMemberDto {
  @ApiRedisString('Member name value')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Member score value.',
    type: Number || String,
    default: 1,
  })
  @IsDefined()
  @isZSetScore()
  score: number | 'inf' | '-inf';
}
