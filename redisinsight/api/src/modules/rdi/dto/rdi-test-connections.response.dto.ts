import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

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

export class RdiTestConnectionsResponseDto {
  @ApiProperty({
    description: 'Sources connection results',
  })
  @Expose()
  @Type(() => RdiTestConnectionResult)
  sources: Record<string, RdiTestConnectionResult>;
}
