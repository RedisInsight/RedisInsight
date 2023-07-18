import {
  IsNotEmpty,
  IsString,
  IsDefined,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteLibraryDto {
  @ApiProperty({
    description: 'Library name',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  libraryName: string;
}
