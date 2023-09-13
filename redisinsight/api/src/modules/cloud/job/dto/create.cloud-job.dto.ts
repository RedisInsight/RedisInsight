import {
  ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { cloudJobDataTransformer } from 'src/modules/cloud/job/transformers/cloud-job-data.transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { CloudJobRunMode } from 'src/modules/cloud/job/models';
import { CreateDatabaseCloudJobDataDto } from 'src/modules/cloud/job/dto/create-database.cloud-job.data.dto';

@ApiExtraModels(CreateDatabaseCloudJobDataDto)
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
    ],
  })
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @Type(cloudJobDataTransformer)
  @ValidateNested()
  data?: CreateDatabaseCloudJobDataDto;
}
