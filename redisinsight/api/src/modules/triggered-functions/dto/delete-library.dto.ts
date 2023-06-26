import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteLibraryDto {
  @ApiProperty({
    description: 'Library name',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  libraryName: string;
}
