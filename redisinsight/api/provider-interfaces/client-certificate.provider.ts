import { CaCertificate } from './models/ca-certificate';

export interface IClientCertificateProvider {
  get(id: string): Promise<CaCertificate>
  // fields: ['c.id', 'c.name']
  getAll(): Promise<CaCertificate>
  create(caCertificate: CaCertificate): Promise<CaCertificate>
  delete(id: string): Promise<void>
}
