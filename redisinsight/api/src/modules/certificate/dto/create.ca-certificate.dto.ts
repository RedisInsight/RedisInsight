import { PickType } from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';

export class CreateCaCertificateDto extends PickType(CaCertificate, [
  'name', 'certificate',
] as const) {}
