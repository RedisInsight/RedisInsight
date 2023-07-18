import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { Expose } from 'class-transformer';
import { CloudJobRunMode } from 'src/modules/cloud/job/models';

export class CreateCloudJobDto {
  @ApiProperty({
    description: 'Job name to create',
    enum: CloudJobName,
  })
  @IsEnum(CloudJobName)
  @IsNotEmpty()
  name: CloudJobName;

  @ApiProperty({
    description: 'Mod in which to run the job.',
    enum: CloudJobRunMode,
  })
  @IsOptional()
  @Expose()
  @IsEnum(CloudJobRunMode)
  @IsNotEmpty()
  runMode: CloudJobRunMode;

  @ApiProperty({
    description: 'Any data for a job. planId for an example',
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  data: object;
}
