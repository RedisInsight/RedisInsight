import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AiAgreement {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  @Expose()
  @IsString()
  databaseId: string;

  @ApiProperty({
    type: String,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    type: Date,
  })
  @Expose()
  createdAt: Date;
}

export class AiAgreementResponse {
  @ApiProperty({
    type: AiAgreement,
    nullable: true,
  })
  @Expose()
  aiAgreement: AiAgreement;
}
