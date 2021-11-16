import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EndpointDto,
  TlsDto,
} from 'src/modules/instances/dto/database-instance.dto';

export enum SentinelMasterStatus {
  Active = 'active',
  Down = 'down',
}

export class SentinelMaster {
  @ApiProperty({
    description: 'The name of Sentinel master.',
    type: String,
    default: 'mastergroup',
  })
  name: string;

  @ApiProperty({
    description: 'The hostname of Sentinel master.',
    type: String,
    default: 'localhost',
  })
  host: string;

  @ApiProperty({
    description: 'The port Sentinel master.',
    type: Number,
    default: 6379,
  })
  port: number;

  @ApiProperty({
    description: 'Sentinel master status',
    enum: SentinelMasterStatus,
    default: SentinelMasterStatus.Active,
  })
  status: SentinelMasterStatus;

  @ApiProperty({
    description: 'The number of slaves.',
    type: Number,
    default: 0,
  })
  numberOfSlaves: number;

  @ApiPropertyOptional({
    description: 'Sentinel master endpoints.',
    type: EndpointDto,
    isArray: true,
  })
  endpoints?: EndpointDto[];
}

export interface ISentinelConnectionOptions {
  name: string;
  sentinels: Array<{ host: string; port: number }>;
  sentinelUsername?: string;
  sentinelPassword?: string;
  tls?: TlsDto;
}
