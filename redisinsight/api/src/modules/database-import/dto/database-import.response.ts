import { ApiProperty } from '@nestjs/swagger';

export class DatabaseImportResponse {
  @ApiProperty({
    description: 'Total elements processed from the import file',
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Number of imported database',
    type: Number,
  })
  success: number;
}
