import { PickType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import {
  IsInt, IsNotEmpty, Max, Min,
} from 'class-validator';

export class ImportDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password',
  'connectionType', 'new',
] as const) {
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  @Min(0)
  @Max(65535)
  port: number;
}
