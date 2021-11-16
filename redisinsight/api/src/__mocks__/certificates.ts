import {
  CaCertDto,
  ClientCertPairDto,
} from 'src/modules/instances/dto/database-instance.dto';
import { CaCertificateEntity } from 'src/modules/core/models/ca-certificate.entity';
import { ClientCertificateEntity } from 'src/modules/core/models/client-certificate.entity';

export const mockCaCertDto: CaCertDto = {
  name: 'ca-cert',
  cert: '-----BEGIN CERTIFICATE-----\nMIIDejCCAmKgAwIBAgIUehUr5AHdJM',
};

export const mockClientCertDto: ClientCertPairDto = {
  name: 'client-cert',
  cert: '-----BEGIN CERTIFICATE-----\nMIIDejCCAmKgAwIBAgIUehUr5AHdJM',
  key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAM',
};

export const mockCaCertEntity: CaCertificateEntity = {
  id: 'a77b23c1-7816-4ea4-b61f-d37795a0f805',
  name: mockCaCertDto.name,
  encryption: null,
  certificate: mockCaCertDto.cert,
  databases: [],
};

export const mockClientCertEntity: ClientCertificateEntity = {
  id: 'a77b23c1-7816-4ea4-b61f-d37795a0f809',
  name: mockClientCertDto.name,
  encryption: null,
  certificate: mockClientCertDto.cert,
  key: mockClientCertDto.key,
  databases: [],
};

export const mockCaCertificatesService = () => ({
  getAll: jest.fn(),
  getOneById: jest.fn(),
});

export const mockClientCertificatesService = () => ({
  getAll: jest.fn(),
  getOneById: jest.fn(),
});
