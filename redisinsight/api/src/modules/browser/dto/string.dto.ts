import {
  ApiProperty, IntersectionType,
} from '@nestjs/swagger';
import {
  IsDefined, IsInt, IsOptional, Min,
} from 'class-validator';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { Type } from 'class-transformer';
import { KeyDto, KeyResponse, KeyWithExpireDto } from './keys.dto';

export class GetStringInfoDto extends KeyDto {
  @ApiProperty({
    description: 'Max length of string',
    type: Number,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Type(() => Number)
  @Min(1)
  stringMaxLen?: number;
}

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
