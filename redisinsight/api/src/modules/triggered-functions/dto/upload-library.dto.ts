import {
  IsDefined,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export class UploadLibraryDto {
  @ApiProperty({
    description: 'Library code',
    type: String,
  })
  @IsRedisString()
  @RedisStringType()
  @IsDefined()
  code: string;

  @ApiPropertyOptional({
    description: 'Library configuration',
    type: String,
  })
  @IsOptional()
  @IsRedisString()
  @RedisStringType()
  configuration?: string;
}
