import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionStatus } from 'src/common/models';
import { CloudDatabase } from 'src/modules/cloud/autodiscovery/models';

export class AddCloudDatabaseResponse {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  subscriptionId: number;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  databaseId: number;

  @ApiProperty({
    description: 'Add Redis Cloud database status',
    default: ActionStatus.Success,
    enum: ActionStatus,
  })
  status: ActionStatus;

  @ApiProperty({
    description: 'Message',
    type: String,
  })
  message: string;

  @ApiPropertyOptional({
    description: 'The database details.',
    type: CloudDatabase,
  })
  databaseDetails?: CloudDatabase;

  @ApiPropertyOptional({
    description: 'Error',
  })
  error?: string | object;
}
