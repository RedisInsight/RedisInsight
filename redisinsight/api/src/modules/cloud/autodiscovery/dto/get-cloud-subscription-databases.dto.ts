import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CloudAuthDto } from 'src/modules/cloud/autodiscovery/dto/cloud-auth.dto';

export class GetCloudSubscriptionDatabasesDto extends CloudAuthDto {
  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;
}
