import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetCloudDatabasesDto {
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
