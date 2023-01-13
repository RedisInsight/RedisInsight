import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Default } from 'src/common/decorators';

export class SshOptions {
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The hostname of SSH server',
    type: String,
    default: 'localhost',
  })
  @Expose()
  @IsNotEmpty()
  @IsString({ always: true })
  @Default(null)
  host: string;

  @ApiProperty({
    description: 'The port of SSH server',
    type: Number,
    default: 22,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Default(null)
  port: number;

  @ApiPropertyOptional({
    description: 'SSH username',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
  username?: string;

  @ApiPropertyOptional({
    description: 'The SSH password',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
  password?: string;

  @ApiPropertyOptional({
    description: 'The SSH private key',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
  privateKey?: string;

  @ApiPropertyOptional({
    description: 'The SSH passphrase',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  @Default(null)
  passphrase?: string;
}
