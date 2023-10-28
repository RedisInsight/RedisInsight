import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class HashFieldDto {
  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  field: RedisString;

  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
