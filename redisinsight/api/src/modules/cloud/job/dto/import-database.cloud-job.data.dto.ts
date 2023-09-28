import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ImportDatabaseCloudJobDataDto {
  @ApiProperty({
    description: 'Subscription id of database',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number;

  @ApiProperty({
    description: 'Database id to import',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  databaseId: number;
}
