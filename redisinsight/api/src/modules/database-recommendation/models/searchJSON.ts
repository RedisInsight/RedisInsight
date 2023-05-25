import { Redis, Cluster } from 'ioredis';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GetKeyInfoResponse } from 'src/modules/browser/dto';

export class SearchJSON {
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
    description: 'Keys info',
    type: GetKeyInfoResponse,
  })
  @Expose()
  keys: GetKeyInfoResponse[];
}
