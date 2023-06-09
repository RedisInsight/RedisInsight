import { PartialType, PickType } from '@nestjs/swagger';
import { LibraryInformation } from 'src/modules/triggered-functions/models/library';

export class ShortLibraryInformation extends PartialType(
  PickType(LibraryInformation, ['name', 'user', 'totalFunctions', 'pendingJobs'] as const),
) {}
