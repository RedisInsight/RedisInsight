import { PickType } from '@nestjs/swagger';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';
import { Expose } from 'class-transformer';

export class CreateClientCertificateDto extends PickType(ClientCertificate, [
  'name', 'key', 'certificate',
] as const) {
  @Expose()
  certificate: string;

  @Expose()
  key: string;
}
