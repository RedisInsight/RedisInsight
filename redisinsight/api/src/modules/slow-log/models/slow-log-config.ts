import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber, Min, NotEquals, ValidateIf,
} from 'class-validator';

export class SlowLogConfig {
  @ApiPropertyOptional({
    description: 'Max logs to store inside Redis slowlog',
    example: 128,
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsNumber()
  @Min(0)
  slowlogMaxLen?: number;

  @ApiPropertyOptional({
    description: 'Store logs with execution time greater than this value (in microseconds)',
    example: 10000,
    type: Number,
  })
  @NotEquals(null)
  @ValidateIf((object, value) => value !== undefined)
  @IsNumber()
  @Min(0)
  slowlogLogSlowerThan?: number;
}
