import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsOptional } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto, RedisDataType } from './key.dto';

export class GetKeyInfoDto extends KeyDto {}

export class GetKeysInfoDto {
  @ApiProperty({
    description: 'List of keys',
    type: String,
    isArray: true,
    example: ['keys', 'key2'],
  })
  @IsDefined()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  keys: RedisString[];

  @ApiPropertyOptional({
    description:
      'Iterate through the database looking for keys of a specific type.',
    enum: RedisDataType,
    example: RedisDataType.Hash,
  })
  @IsEnum(RedisDataType, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      RedisDataType,
    )}.`,
  })
  @IsOptional()
  type?: RedisDataType;
}
