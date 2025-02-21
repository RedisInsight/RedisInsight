import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Expose, Transform, Type, plainToClass,
} from 'class-transformer';

export enum RdiTestConnectionStatus {
  Success = 'success',
  Fail = 'fail',
}

class ErrorDetails {
  @ApiProperty({
    description: 'Error code',
    type: String,
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Error message',
    type: String,
  })
  @Expose()
  message: string;
}

export class RdiTestConnectionResult {
  @ApiProperty({
    description: 'Connection status',
    enum: RdiTestConnectionStatus,
  })
  @Expose()
  status: RdiTestConnectionStatus;

  @ApiPropertyOptional({
    description: 'Error details if any',
    type: ErrorDetails,
  })
  @Expose()
  @Type(() => ErrorDetails)
  error?: ErrorDetails;
}

export class RdiSourcesConnectionResult {
  @ApiProperty({ description: 'Indicates if the source is connected' })
  @Expose()
  connected: boolean;

  @ApiProperty({ description: 'Error message if connection fails', required: false })
  @Expose()
  error?: string;
}

export class RdiTestConnectionsResponseDto {
  @ApiProperty({
    description: 'Sources connection results',
  })
  @Expose()
  // TODO: fix this
  // @Type(() => RdiSourcesConnectionResult)
  sources: Record<string, RdiSourcesConnectionResult>

  @ApiProperty({
    description: 'Targets connection results',
  })
  @Expose()
  @Transform(({ value }) => Object.fromEntries(
    Object.entries(value || {}).map(([key, val]) => [key, plainToClass(RdiTestConnectionResult, val)]),
  ))
  targets: Record<string, RdiTestConnectionResult>;
}
