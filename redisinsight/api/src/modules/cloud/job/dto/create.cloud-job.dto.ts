import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobRunMode } from 'src/modules/cloud/job/models';
// eslint-disable-next-line import/no-cycle
import { cloudJobDataTransformer } from '../transformers/cloud-job-data.transformer';

export class CreateDatabaseCloudJobDataDto {
  @ApiProperty({
    description: 'Plan id for create a subscription.',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  planId: number;
}

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

  @ApiPropertyOptional({
    description: 'Any data for create a job.',
    oneOf: [
      { $ref: getSchemaPath(CreateDatabaseCloudJobDataDto) },
      { $ref: getSchemaPath(undefined) },
    ],
    type: cloudJobDataTransformer,
  })
  @ValidateNested()
  @Expose()
  @IsNotEmpty()
  @IsOptional()
  data: CreateDatabaseCloudJobDataDto | undefined;
}
