import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RdiType {
  API = 'api',
  GEARS = 'gears',
}

export class Rdi {
  @ApiProperty({
    description: 'RDI id.',
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'RDI type',
    enum: RdiType,
  })
  @Expose()
  @IsEnum(RdiType, {
    message: `Type must be a valid enum value from: ${Object.values(RdiType)}.`,
  })
  @IsOptional()
  type?: RdiType;

  @ApiPropertyOptional({
    description: 'Base url of API to connect to (for API type only)',
    example: 'https://example.com',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'The hostname of RDI database, for example redis.acme.com. (for GEARS type only)',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  @IsString()
  host?: string;

  @ApiPropertyOptional({
    description: 'The port RDI database is available on. (for GEARS type only)',
    type: Number,
    default: 6379,
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  @IsInt()
  port?: number;

  @ApiProperty({
    description: 'A name to associate with RDI',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @ApiPropertyOptional({
    description: 'RDI or API username',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'RDI or API password',
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Time of the last connection to RDI.',
    type: String,
    format: 'date-time',
    example: '2021-01-06T12:44:39.000Z',
  })
  @Expose()
  lastConnection?: Date;

  @ApiPropertyOptional({
    description: 'The version of RDI being used',
    type: String,
  })
  @IsOptional()
  @Expose()
  @IsNotEmpty()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'A newly created connection',
    type: Boolean,
    default: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean({ always: true })
  new?: boolean;
}
