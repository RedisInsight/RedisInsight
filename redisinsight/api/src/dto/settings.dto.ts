import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInstance,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Exclude, Transform, Type } from 'class-transformer';
import { IAgreementSpec } from 'src/models';
import { pickDefinedAgreements } from 'src/dto/dto-transformer';

export class GetAgreementsSpecResponse {
  @ApiProperty({
    description: 'Version of agreements specification.',
    type: String,
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Agreements specification.',
    type: Object,
    example: {
      eula: {
        defaultValue: false,
        required: true,
        since: '1.0.0',
        editable: false,
        title: 'License Terms',
        label: 'I have read and understood the License Terms',
      },
    },
  })
  agreements: IAgreementSpec;
}

export class GetUserAgreementsResponse {
  @ApiProperty({
    description: 'Last version on agreements set by the user.',
    type: String,
  })
  version: string;

  eula?: boolean;

  analytics?: boolean;

  @Exclude()
  encryption?: boolean;
}

export class GetAppSettingsResponse {
  @ApiProperty({
    description: 'Applied application theme.',
    type: String,
    example: 'DARK',
  })
  theme: string;

  @ApiProperty({
    description: 'Applied the threshold for scan operation.',
    type: Number,
    example: 10000,
  })
  scanThreshold: number;

  @ApiProperty({
    description: 'Applied the batch of the commands for workbench.',
    type: Number,
    example: 5,
  })
  batchSize: number;

  @ApiProperty({
    description: 'Agreements set by the user.',
    type: GetUserAgreementsResponse,
    example: {
      version: '1.0.0',
      eula: true,
      analytics: true,
      encryption: true,
    },
  })
  agreements: GetUserAgreementsResponse;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Application theme.',
    type: String,
    example: 'DARK',
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({
    description: 'Threshold for scan operation.',
    type: Number,
    example: 10000,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(500)
  scanThreshold?: number;

  @ApiPropertyOptional({
    description: 'Batch for workbench pipeline.',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(0)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Agreements',
    type: Map,
    example: {
      eula: true,
    },
  })
  @IsOptional()
  @Type(() => Map)
  @IsInstance(Map)
  @Transform(pickDefinedAgreements)
  @IsBoolean({ each: true })
  agreements?: Map<string, boolean>;
}
