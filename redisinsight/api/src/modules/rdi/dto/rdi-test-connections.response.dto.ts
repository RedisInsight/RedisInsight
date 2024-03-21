import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export enum RdiTestConnectionStatus {
  Success = 'success',
  Fail = 'fail',
}

export class RdiTestConnectionResult {
  @ApiProperty({
    type: Number,
  })
  @Expose()
  index: number;

  @ApiProperty({
    description: 'Connection status',
    enum: RdiTestConnectionStatus,
  })
  @Expose()
  status: RdiTestConnectionStatus;

  @ApiPropertyOptional({
    description: 'Rdi target endpoint',
    type: String,
  })
  @Expose()
  endpoint: string;

  @ApiPropertyOptional({
    description: 'Error message if any',
    type: String,
  })
  @Expose()
  error?: string;
}

export class RdiTestConnectionsResponseDto {
  @ApiProperty({
    description: 'Successfully connected targets',
    type: RdiTestConnectionResult,
  })
  @Expose()
  @Type(() => RdiTestConnectionResult)
  success: RdiTestConnectionResult;

  @ApiProperty({
    description: 'Failed connected targets',
    type: RdiTestConnectionResult,
  })
  @Expose()
  @Type(() => RdiTestConnectionResult)
  fail: RdiTestConnectionResult;
}
