import { PickType } from '@nestjs/swagger';
import { ClientCertificate } from 'src/modules/certificate/models/client-certificate';

export class CreateClientCertificateDto extends PickType(ClientCertificate, [
  'name', 'key', 'certificate',
] as const) {}
