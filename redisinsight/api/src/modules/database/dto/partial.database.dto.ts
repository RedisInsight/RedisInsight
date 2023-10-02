import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsInt, IsString, Max, MaxLength, Min, ValidateIf, IsOptional, IsNotEmpty,
} from 'class-validator';

export class PartialDatabaseDto extends PartialType(
  OmitType(CreateDatabaseDto, ['timeout'] as const),
  ) {
  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  @MaxLength(500)
  name: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString({ always: true })
  host: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsInt({ always: true })
  port: number;

  @ApiPropertyOptional({
    description: 'Connection timeout',
    type: Number,
    default: 30_000,
  })
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  @Min(1_000)
  @Max(1_000_000_000)
  @IsInt({ always: true })
  timeout?: number;
}
