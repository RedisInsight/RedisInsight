import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

export class UploadCustomTutorialDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ZIP archive with tutorial static files',
  })
  @IsFile()
  @HasMimeType(['application/zip'])
  file: MemoryStoredFile;

  @ApiProperty({
    description: 'Name to show for custom tutorials',
  })
  @Expose()
  @IsString()
  name: string;
}
