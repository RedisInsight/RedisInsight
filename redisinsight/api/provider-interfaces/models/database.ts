import { CaCertificate } from './ca-certificate';
import { ClientCertificate } from './client-certificate';

export class Database {
  id: string;

  host: string;

  port: number;

  name: string;

  db: number;

  connectionType: string;

  username: string;

  password: string;

  lastConnection: Date;

  provider: string;

  nameFromProvider: string;

  nodes?: {
    host: string,
    port: number,
  }; // cluster nodes

  modules: Array<{
    name: string;
    version?: number;
    semanticVersion?: string;
  }>;

  sentinel?: {
    name: string,
    username: string,
    password: string,
  };

  tls?: boolean;

  tlsServername?: string; // sni

  verifyServerCert?: boolean;

  caCert?: CaCertificate;

  clientCert?: ClientCertificate;

  // tls?: {
  //   verifyServerCert?: boolean;
  //   servername?: string;
  //   ca?: string,
  //   cert?: string;
  //   key?: string;
  // };
}
