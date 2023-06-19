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
    description: 'Library config',
    type: String,
  })
  @IsOptional()
  @IsRedisString()
  @RedisStringType()
  config?: string;
}
