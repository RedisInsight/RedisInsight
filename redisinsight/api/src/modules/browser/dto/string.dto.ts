import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import { KeyDto, KeyWithExpireDto } from './keys.dto';

export class SetStringDto extends KeyDto {
  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @IsDefined()
  @IsString()
  value: string;
}

export class SetStringWithExpireDto extends IntersectionType(
  SetStringDto,
  KeyWithExpireDto,
) {}

export class GetStringValueResponse {
  @ApiProperty({
    type: String,
    description: 'Key Name',
  })
  keyName: string;

  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @IsString()
  value: string;
}
