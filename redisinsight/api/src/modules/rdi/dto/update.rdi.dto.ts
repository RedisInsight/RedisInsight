import { OmitType, PartialType } from '@nestjs/swagger';
import { Rdi } from 'src/modules/rdi/models';

export class UpdateRdiDto extends PartialType(OmitType(Rdi, [
  'id', 'lastConnection',
] as const)) {}
