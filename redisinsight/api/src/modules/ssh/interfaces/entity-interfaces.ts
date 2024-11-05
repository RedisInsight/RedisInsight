export interface IBaseSshOptionsEntity {
  id: string;
  host: string;
  port: number;
  encryption?: string;
  username?: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  databaseId?: string;
} 