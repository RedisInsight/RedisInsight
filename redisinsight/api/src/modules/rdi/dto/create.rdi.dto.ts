import { OmitType } from '@nestjs/swagger';
import { Rdi, RdiType } from 'src/modules/rdi/models';
import { ValidateIf } from 'class-validator';

export class CreateRdiDto extends OmitType(Rdi, [
  'id', 'lastConnection',
] as const) {
  @ValidateIf(({ type }) => type === RdiType.API)
  url?: string;

  @ValidateIf(({ type }) => type === RdiType.GEARS)
  host?: string;

  @ValidateIf(({ type }) => type === RdiType.GEARS)
  port?: number;
}
