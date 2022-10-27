import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Endpoint {
  @ApiProperty({
    description:
      'The hostname of your Redis database, for example redis.acme.com.'
      + ' If your Redis server is running on your local machine, you can enter either 127.0.0.1 or localhost.',
    type: String,
    default: 'localhost',
  })
  @IsNotEmpty()
  @IsString({ always: true })
  host: string;

  @ApiProperty({
    description: 'The port your Redis database is available on.',
    type: Number,
    default: 6379,
  })
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  port: number;
}
