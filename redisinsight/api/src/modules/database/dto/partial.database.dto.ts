import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';
import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt, IsString, Max, MaxLength, Min, ValidateIf, IsOptional, IsNotEmpty, IsNotEmptyObject,
} from 'class-validator';
import { SshOptions } from 'src/modules/ssh/models/ssh-options';

export class PartialDatabaseDto extends PartialType(
  OmitType(CreateDatabaseDto, ['timeout', 'sshOptions'] as const),
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
  @IsNotEmpty()
  @IsOptional()
  @Min(1_000)
  @Max(1_000_000_000)
  @IsInt({ always: true })
  timeout?: number;

  @ValidateIf((object, value) => value !== undefined)
  @IsOptional()
  @IsNotEmptyObject()
  sshOptions?: Partial<SshOptions>;
}
