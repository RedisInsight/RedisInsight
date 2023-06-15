import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNotEmpty } from 'class-validator';

export class AddCloudDatabaseDto {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  subscriptionId: number;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  databaseId: number;
}
