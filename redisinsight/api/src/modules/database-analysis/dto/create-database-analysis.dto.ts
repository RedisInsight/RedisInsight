import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDatabaseAnalysisDto {
  @ApiProperty({
    description: 'Namespace delimiter',
    type: String,
    default: ':',
  })
  @IsOptional()
  @IsString()
  delimiter: string = ':';
}
