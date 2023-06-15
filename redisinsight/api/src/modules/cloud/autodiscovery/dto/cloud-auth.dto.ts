import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CloudAuthDto {
  @ApiProperty({
    description: 'Cloud API account key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  apiKey: string;

  @ApiProperty({
    description: 'Cloud API secret key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  apiSecret: string;
}
