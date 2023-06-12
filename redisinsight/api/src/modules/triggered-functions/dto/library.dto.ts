import {
  IsDefined,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LibraryDto {
  @ApiProperty({
    description: 'Library Name',
    type: String,
  })
  @IsDefined()
  libraryName: string;
}
