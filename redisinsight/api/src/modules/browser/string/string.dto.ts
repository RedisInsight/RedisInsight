import {
  ApiProperty, IntersectionType,
} from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { KeyDto, KeyResponse, KeyWithExpireDto } from 'src/modules/browser/keys/keys.dto';

export class SetStringDto extends KeyDto {
  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class SetStringWithExpireDto extends IntersectionType(
  SetStringDto,
  KeyWithExpireDto,
) {}

export class GetStringValueResponse extends KeyResponse {
  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}
