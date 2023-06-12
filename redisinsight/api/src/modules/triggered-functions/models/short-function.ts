import { PartialType, PickType } from '@nestjs/swagger';
import { Function } from 'src/modules/triggered-functions/models';

export class ShortFunction extends PartialType(
  PickType(Function, ['name', 'type'] as const),
) {}
