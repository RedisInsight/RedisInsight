import { Module } from '@nestjs/common';
import { CaCertificateController } from 'src/modules/certificate/ca-certificate.controller';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { LocalCaCertificateRepository } from 'src/modules/certificate/repositories/local.ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { LocalClientCertificateRepository } from 'src/modules/certificate/repositories/local.client-certificate.repository';
import { ClientCertificateController } from 'src/modules/certificate/client-certificate.controller';

@Module({
  controllers: [
    CaCertificateController,
    ClientCertificateController,
  ],
  providers: [
    CaCertificateService,
    ClientCertificateService,
    {
      provide: CaCertificateRepository,
      useClass: LocalCaCertificateRepository,
    },
    {
      provide: ClientCertificateRepository,
      useClass: LocalClientCertificateRepository,
    },
  ],
  exports: [
    CaCertificateService,
    ClientCertificateService,
    CaCertificateRepository,
    ClientCertificateRepository,
  ],
})
export class CertificateModule {}
