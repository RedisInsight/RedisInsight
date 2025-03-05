import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Key of the tag.',
    type: String,
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({
    description: 'Value of the tag.',
    type: String,
  })
  @IsOptional()
  @IsString()
  value?: string;
}
