import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AiDatabaseAgreement {
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
    type: Boolean,
  })
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  dataConsent: boolean;
}
