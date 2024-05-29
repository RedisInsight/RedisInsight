import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageType } from 'src/modules/server/models/server';

export class GetServerInfoResponse {
  @ApiProperty({
    description: 'Server identifier.',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Time of the first server launch.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  createDateTime: string;

  @ApiProperty({
    description: 'Version of the application.',
    type: String,
    example: '2.0.0',
  })
  appVersion: string;

  @ApiProperty({
    description: 'The operating system platform.',
    type: String,
    example: 'linux',
  })
  osPlatform: string;

  @ApiProperty({
    description: 'Application build type.',
    type: String,
    example: 'ELECTRON',
  })
  buildType: string;

  @ApiProperty({
    description: 'Application package type.',
    enum: PackageType,
    example: 'app-image',
  })
  packageType: PackageType;

  @ApiPropertyOptional({
    description: 'Fixed Redis database id.',
    type: String,
  })
  fixedDatabaseId?: string;

  @ApiProperty({
    description: 'List of available encryption strategies',
    type: [String],
    example: ['PLAIN', 'KEYTAR'],
  })
  encryptionStrategies: string[];

  @ApiProperty({
    description: 'Server session id.',
    type: Number,
  })
  sessionId: number;

  @ApiProperty({
    description: 'Control number for A/B testing',
    type: Number,
  })
  controlNumber: number;

  @ApiProperty({
    description: 'Control group (bucket)',
    type: String,
  })
  controlGroup: string;
}
