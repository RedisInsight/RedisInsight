import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendAiQueryMessageDto {
  @ApiProperty({
    description: 'Database id',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  databaseId: string;

  @ApiProperty({
    description: 'Message content',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
