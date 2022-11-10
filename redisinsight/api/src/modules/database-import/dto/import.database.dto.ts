import { PickType } from '@nestjs/swagger';
import { Database } from 'src/modules/database/models/database';

export class ImportDatabaseDto extends PickType(Database, [
  'host', 'port', 'name', 'db', 'username', 'password',
  'connectionType',
] as const) {}
