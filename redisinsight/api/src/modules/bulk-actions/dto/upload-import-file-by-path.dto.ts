import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImportFileByPathDto {
  @ApiProperty({
    type: 'string',
    description: 'Internal path to data file',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
