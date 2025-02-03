import { PickType } from '@nestjs/swagger';
import { AiDatabaseAgreement } from '../models/ai.database.agreement';

export class UpdateAiDatabaseAgreementDto extends PickType(AiDatabaseAgreement, [
  'dataConsent',
] as const) {}
