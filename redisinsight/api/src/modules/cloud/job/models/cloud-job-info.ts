import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { HttpException } from '@nestjs/common';

export enum CloudJobStatus {
  Initializing = 'initializing',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export class CloudJobInfo {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: CloudJobName,
  })
  @Expose()
  name: CloudJobName;

  @ApiProperty({
    enum: CloudJobStatus,
  })
  @Expose()
  status: CloudJobStatus;

  @ApiPropertyOptional({
    description: 'Children job if any',
    type: () => CloudJobInfo,
  })
  @Expose()
  @Type(() => CloudJobInfo)
  child?: CloudJobInfo;

  @ApiPropertyOptional({
    description: 'Error if any',
    type: () => HttpException,
  })
  @Expose()
  @Type(() => HttpException)
  error?: HttpException;
}
