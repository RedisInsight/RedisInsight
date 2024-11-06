import { CloudDatabaseDetailsEntity } from 'src/modules/cloud/database/entities/cloud-database-details.entity';
import { DatabaseEntity } from '../entities/database.entity';

export interface IDatabaseCloudDetails {
  id: string;
  cloudId: number;
  subscriptionType: string;
  planMemoryLimit?: number;
  memoryLimitMeasurementUnit?: number;
  free?: boolean;
  database?: DatabaseEntity;
}

export interface IDatabaseEntity {
  id: string;
  cloudDetails?: CloudDatabaseDetailsEntity;
  // ... other properties you need
}
