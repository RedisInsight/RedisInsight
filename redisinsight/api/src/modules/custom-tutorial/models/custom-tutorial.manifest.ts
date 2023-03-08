import { CustomTutorialActions } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested
} from 'class-validator';

export enum CustomTutorialManifestType {
  CodeButton = 'code-button',
  Group = 'group',
  InternalLink = 'internal-link',
}

export interface ICustomTutorialManifest {
  id: string,
  type: CustomTutorialManifestType,
  label: string,
  children?: Record<string, ICustomTutorialManifest>,
  args?: Record<string, any>,
  _actions?: CustomTutorialActions[],
  _path?: string,
}

export class CustomTutorialManifestArgs {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  path?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsBoolean()
  initialIsOpen?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Expose()
  @IsBoolean()
  withBorder?: boolean;
}

export class CustomTutorialManifest {
  @ApiProperty({ type: String })
  @Expose()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: CustomTutorialManifestType })
  @Expose()
  @IsEnum(CustomTutorialManifestType)
  type: CustomTutorialManifestType;

  @ApiProperty({ type: String })
  @Expose()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ type: CustomTutorialManifestArgs })
  @IsOptional()
  @Expose()
  @ValidateNested()
  @Type(() => CustomTutorialManifestArgs)
  args?: CustomTutorialManifestArgs;

  @ApiPropertyOptional({ type: CustomTutorialManifest })
  @IsOptional()
  @Expose()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CustomTutorialManifest)
  children?: CustomTutorialManifest[];
}

export class RootCustomTutorialManifest extends CustomTutorialManifest {
  @ApiPropertyOptional({ enum: CustomTutorialActions })
  @IsOptional()
  @Expose()
  @IsArray()
  @IsEnum(CustomTutorialActions, { each: true })
  _actions?: CustomTutorialActions[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Expose()
  @IsString()
  @IsNotEmpty()
  _path?: string;
}
