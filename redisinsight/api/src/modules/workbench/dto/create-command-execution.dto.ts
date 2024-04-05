import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';

export enum RunQueryMode {
  Raw = 'RAW',
  ASCII = 'ASCII',
}

export enum ResultsMode {
  Default = 'DEFAULT',
  GroupMode = 'GROUP_MODE',
  Silent = 'SILENT',
}

export class CreateCommandExecutionDto {
  @ApiProperty({
    type: String,
    description: 'Redis command',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({
    description: 'Workbench mode',
    default: RunQueryMode.ASCII,
    enum: RunQueryMode,
  })
  @IsOptional()
  @IsEnum(RunQueryMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      RunQueryMode,
    )}.`,
  })
  mode?: RunQueryMode = RunQueryMode.ASCII;

  @ApiPropertyOptional({
    description: 'Workbench group mode',
    default: ResultsMode.Default,
    enum: ResultsMode,
  })
  @IsOptional()
  @IsEnum(ResultsMode, {
    message: `resultsMode must be a valid enum value. Valid values: ${Object.values(
      ResultsMode,
    )}.`,
  })
  resultsMode?: ResultsMode;
}
