import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AiQueryMessageType } from 'src/modules/ai/query/entities/ai-query.message.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AiQueryMessage {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: AiQueryMessageType,
  })
  @Expose()
  @IsEnum(AiQueryMessageType)
  @IsNotEmpty()
  type: AiQueryMessageType;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  databaseId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  content: string = '';

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}
