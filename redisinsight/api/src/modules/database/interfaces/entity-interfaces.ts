export interface IBaseDatabaseEntity {
  id: string;
  host: string;
  port: number;
  name: string;
  // ... other basic properties
}

export interface IBaseCloudDetailsEntity {
  id: string;
  cloudId: number;
  subscriptionType: string;
}

export interface IBaseSshOptionsEntity {
  id: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
}
