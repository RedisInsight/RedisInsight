import { PickType } from '@nestjs/swagger';
import { CaCertificate } from 'src/modules/certificate/models/ca-certificate';
import { Expose } from 'class-transformer';

export class CreateCaCertificateDto extends PickType(CaCertificate, [
  'name', 'certificate',
] as const) {
  @Expose()
  certificate: string;
}
