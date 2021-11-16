import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty, IsArray, IsDefined, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ClusterConnectionDetailsDto,
  RedisEnterpriseDatabase,
} from 'src/modules/redis-enterprise/dto/cluster.dto';

export enum AddRedisDatabaseStatus {
  Success = 'success',
  Fail = 'fail',
}

export class AddRedisEnterpriseDatabasesDto extends ClusterConnectionDetailsDto {
  @ApiProperty({
    description: 'The unique IDs of the databases.',
    type: Number,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  @Type(() => Number)
  uids: number[];
}

export class AddRedisEnterpriseDatabaseResponse {
  @ApiProperty({
    description: 'The unique ID of the database',
    type: Number,
  })
  uid: number;

  @ApiProperty({
    description: 'Add Redis Enterprise database status',
    default: AddRedisDatabaseStatus.Success,
    enum: AddRedisDatabaseStatus,
  })
  status: AddRedisDatabaseStatus;

  @ApiProperty({
    description: 'Message',
    type: String,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'The database details.',
    type: RedisEnterpriseDatabase,
  })
  databaseDetails?: RedisEnterpriseDatabase;

  @ApiPropertyOptional({
    description: 'Error',
  })
  error?: string | object;
}
