import { ConnectionType, Compressor } from 'src/modules/database/entities/database.entity';

export interface ISshOptions {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export interface ICloudDatabaseDetails {
  id: string;
  cloudId: number;
  subscriptionType: string;
  planMemoryLimit?: number;
  memoryLimitMeasurementUnit?: number;
  free?: boolean;
}