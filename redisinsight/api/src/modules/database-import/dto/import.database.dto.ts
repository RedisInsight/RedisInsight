import { PickType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ImportDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password',
  'connectionType',
] as const) {
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  port: number;
}
