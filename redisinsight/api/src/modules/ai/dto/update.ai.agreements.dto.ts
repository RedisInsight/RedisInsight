import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdateAiAgreementsDto {
  @ApiProperty({
    description: 'General AiAgreement should or should not exist boolean',
    type: Boolean,
  })
  @IsBoolean()
  general: boolean;

  @ApiPropertyOptional({
    description: 'Database AiAgreement should or should not exist boolean',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  db: boolean;
}
