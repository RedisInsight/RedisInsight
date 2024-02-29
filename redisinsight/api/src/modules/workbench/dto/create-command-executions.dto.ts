import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsArray, IsDefined, IsOptional, IsString, ArrayNotEmpty,
} from 'class-validator';
import { RunQueryMode, ResultsMode } from './create-command-execution.dto';

export class CreateCommandExecutionsDto {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'Redis commands',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsString({ each: true })
  commands: string[];

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

  @IsOptional()
  @IsEnum(ResultsMode, {
    message: `resultsMode must be a valid enum value. Valid values: ${Object.values(
      ResultsMode,
    )}.`,
  })
  resultsMode?: ResultsMode;
}
