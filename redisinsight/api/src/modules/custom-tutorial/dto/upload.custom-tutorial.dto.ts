import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  HasMimeType, IsFile, MaxFileSize, MemoryStoredFile,
} from 'nestjs-form-data';

export class UploadCustomTutorialDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ZIP archive with tutorial static files',
  })
  @IsFile()
  @HasMimeType(['application/zip'])
  @MaxFileSize(10 * 1024 * 1024)
  file: MemoryStoredFile;

  @ApiProperty({
    description: 'Name to show for custom tutorials',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;
}
