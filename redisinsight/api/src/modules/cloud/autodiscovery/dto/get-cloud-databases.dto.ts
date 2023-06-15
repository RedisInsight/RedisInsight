import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CloudAuthDto } from 'src/modules/cloud/autodiscovery/dto/cloud-auth.dto';

export class GetCloudDatabasesDto extends CloudAuthDto {
  @ApiProperty({
    description: 'Subscription Ids',
    type: Number,
    isArray: true,
  })
  @IsDefined()
  @IsInt({ each: true })
  @Type(() => Number)
  @Transform((value: number | number[]) => {
    if (typeof value === 'number') {
      return [value];
    }
    return value;
  })
  subscriptionIds: number[];
}
