import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  IsFile, MaxFileSize, MemoryStoredFile,
} from 'nestjs-form-data';

export class UploadImportFileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Import file (with list of commands to execute)',
  })
  @IsNotEmpty()
  @IsFile()
  @MaxFileSize(100 * 1024 * 1024)
  file?: MemoryStoredFile;
}
