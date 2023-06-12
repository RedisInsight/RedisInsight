import { PartialType, PickType } from '@nestjs/swagger';
import { Library } from 'src/modules/triggered-functions/models/library';

export class ShortLibrary extends PartialType(
  PickType(Library, ['name', 'user', 'totalFunctions', 'pendingJobs'] as const),
) {}
