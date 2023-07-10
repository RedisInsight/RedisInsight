import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CloudJobName } from 'src/modules/cloud/job/constants';

export class CreateCloudJobDto {
  @ApiProperty({
    description: 'Job name to create',
    enum: CloudJobName,
  })
  @IsEnum(CloudJobName)
  @IsNotEmpty()
  name: CloudJobName;
}
