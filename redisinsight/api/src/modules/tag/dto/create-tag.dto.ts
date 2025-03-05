import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Key of the tag.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Value of the tag.',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  value: string;
}
