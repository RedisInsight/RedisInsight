import { PickType } from '@nestjs/swagger';
import { Library } from 'src/modules/triggered-functions/models/library';

export class ShortLibrary extends PickType(Library, ['name', 'user', 'totalFunctions', 'pendingJobs'] as const) {}
