export interface AzureSubscription {
  id: string;
  subscriptionId: string;
  displayName: string;
  state: string;
  tenantId: string;
}

export interface AzureRedisDatabase {
  id: string;
  name: string;
  type: string;
  location: string;
  properties: {
    provisioningState: string;
    hostName: string;
    port: number;
    sslPort: number;
    redisVersion: string;
    sku: {
      name: string;
      family: string;
      capacity: number;
    };
  };
}

export interface AzureRedisKeys {
  primaryKey: string;
  secondaryKey: string;
}

export interface AzureErrorResponse {
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export interface AzureClientMetadata {
  id: string;
}