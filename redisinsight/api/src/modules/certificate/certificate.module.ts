import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { CaCertificateController } from 'src/modules/certificate/ca-certificate.controller';
import { CaCertificateService } from 'src/modules/certificate/ca-certificate.service';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { LocalCaCertificateRepository } from 'src/modules/certificate/repositories/local.ca-certificate.repository';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { LocalClientCertificateRepository } from 'src/modules/certificate/repositories/local.client-certificate.repository';
import { ClientCertificateController } from 'src/modules/certificate/client-certificate.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CaCertificateEntity,
      ClientCertificateEntity,
    ]),
  ],
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
  ],
})
export class CertificateModule {}
