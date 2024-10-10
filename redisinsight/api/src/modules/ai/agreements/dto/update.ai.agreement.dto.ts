import { PickType } from '@nestjs/swagger';
import { AiAgreement } from '../models/ai.agreement';

export class UpdateAiAgreementDto extends PickType(AiAgreement, [
  'consent',
] as const) {}
