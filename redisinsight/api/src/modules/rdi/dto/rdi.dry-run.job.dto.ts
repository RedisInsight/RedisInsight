import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { SerializedJsonValidator } from 'src/validators';

export class RdiDryRunJobDto {
  @ApiProperty({
    description: 'Input data',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  @Validate(SerializedJsonValidator)
  input: string;

  @ApiProperty({
    description: 'Job file',
    type: String,
  })
  @Expose()
  @IsNotEmpty()
  @IsString()
  job: string;
}
