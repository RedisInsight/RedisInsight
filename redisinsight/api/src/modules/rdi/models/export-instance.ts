import { PickType } from '@nestjs/swagger';
import { Rdi } from './rdi';

export class ExportInstance extends PickType(Rdi, [
  'id',
  'url',
  'alias',
  'username',
  'password',
  'lastConnection',
] as const) {}
