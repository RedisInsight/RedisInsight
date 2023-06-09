import {
  IsDefined,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export class LibraryDto {
  @ApiProperty({
    description: 'Key Name',
    type: String,
  })
  @IsDefined()
  // @IsRedisString()
  // @RedisStringType()
  libraryName: string;
}
