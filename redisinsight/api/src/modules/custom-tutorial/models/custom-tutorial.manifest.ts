import { CustomTutorialActions } from 'src/modules/custom-tutorial/models/custom-tutorial';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';

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

  children: Record<string, CustomTutorialManifest>
}
