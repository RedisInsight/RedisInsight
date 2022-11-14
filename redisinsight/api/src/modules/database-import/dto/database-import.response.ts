import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class DatabaseImportResponse {
  @ApiProperty({
    description: 'Total elements processed from the import file',
    type: Number,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Number of imported database',
    type: Number,
  })
  @Expose()
  success: number;

  @Exclude()
  errors: Error[];
}
