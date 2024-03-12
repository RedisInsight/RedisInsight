import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined, IsInt, IsOptional, Min,
} from 'class-validator';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { RunQueryMode, ResultsMode } from 'src/modules/workbench/dto/create-command-execution.dto';
import { Expose } from 'class-transformer';

export class ResultsSummary {
  @ApiProperty({
    description: 'Total number of commands executed',
    type: Number,
  })
  @IsDefined()
  total: number;

  @ApiProperty({
    description: 'Total number of successful commands executed',
    type: Number,
  })
  @IsDefined()
  success: number;

  @ApiProperty({
    description: 'Total number of failed commands executed',
    type: Number,
  })
  @IsDefined()
  fail: number;
}

export class CommandExecution {
  @ApiProperty({
    description: 'Command execution id',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Redis command executed',
    type: String,
  })
  @Expose()
  command: string;

  @ApiPropertyOptional({
    description: 'Workbench mode',
    default: RunQueryMode.ASCII,
    enum: RunQueryMode,
  })
  @Expose()
  mode?: RunQueryMode = RunQueryMode.ASCII;

  @ApiPropertyOptional({
    description: 'Workbench result mode',
    default: ResultsMode.Default,
    enum: ResultsMode,
  })
  @Expose()
  resultsMode?: ResultsMode = ResultsMode.Default;

  @ApiPropertyOptional({
    description: 'Workbench executions summary',
    type: () => ResultsSummary,
  })
  @Expose()
  summary?: ResultsSummary;

  @ApiProperty({
    description: 'Command execution result',
    type: () => CommandExecutionResult,
    isArray: true,
  })
  @Expose()
  result: CommandExecutionResult[];

  @ApiPropertyOptional({
    description: 'Result did not stored in db',
    type: Boolean,
  })
  @Expose()
  isNotStored?: boolean;

  @ApiProperty({
    description: 'Date of command execution',
    type: Date,
  })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Workbench command execution time',
    type: Number,
  })
  @Expose()
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  @Expose()
  @IsInt()
  @Min(0)
  @IsOptional()
  db?: number;

  constructor(partial: Partial<CommandExecution> = {}) {
    Object.assign(this, partial);
  }
}
