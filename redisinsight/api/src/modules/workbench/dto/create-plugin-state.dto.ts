import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePluginStateDto {
  @ApiProperty({
    type: String,
    description: 'State',
  })
  @IsNotEmpty()
  state: any;
}
