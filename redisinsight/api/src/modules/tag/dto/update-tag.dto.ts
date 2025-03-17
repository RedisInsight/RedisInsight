import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Key of the tag.',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^[a-zA-Z0-9\-_\.@:+ ]+$/)
  key?: string;

  @ApiPropertyOptional({
    description: 'Value of the tag.',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Length(1, 128)
  @Matches(/^[a-zA-Z0-9\-_\.@:+ ]+$/)
  value?: string;
}
