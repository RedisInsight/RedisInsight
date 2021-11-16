import { ApiProperty } from '@nestjs/swagger';

export class DatabaseOverview {
  @ApiProperty({
    description: 'Redis database version',
    type: String,
  })
  version: string;

  @ApiProperty({
    description: 'Total number of bytes allocated by Redis primary shards',
    type: Number,
  })
  usedMemory: number;

  @ApiProperty({
    description: 'Total number of keys inside Redis primary shards',
    type: Number,
  })
  totalKeys: number;

  @ApiProperty({
    description: 'Median for connected clients in the all shards',
    type: Number,
  })
  connectedClients: number;

  @ApiProperty({
    description: 'Sum of current commands per second in the all shards',
    type: Number,
  })
  opsPerSecond: number;

  @ApiProperty({
    description: 'Sum of current network input in the all shards (kbps)',
    type: Number,
  })
  networkInKbps: number;

  @ApiProperty({
    description: 'Sum of current network out in the all shards (kbps)',
    type: Number,
  })
  networkOutKbps: number;

  @ApiProperty({
    description: 'Sum of current cpu usage in the all shards (%)',
    type: Number,
  })
  cpuUsagePercentage: number;
}
