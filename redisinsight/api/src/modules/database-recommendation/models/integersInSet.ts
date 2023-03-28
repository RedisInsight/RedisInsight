import { Redis, Cluster } from 'ioredis';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';

export class IntegersInSets {
  @ApiProperty({
    description: 'Redis client',
  })
  @Expose()
  client: Redis | Cluster;

  @ApiProperty({
    description: 'Database id',
    type: String,
    example: 'id',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Set Members',
  })
  @Expose()
  members: RedisString[];
}
