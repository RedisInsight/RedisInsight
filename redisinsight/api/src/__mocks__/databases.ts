import { Database } from 'src/modules/database/models/database';
import {
  mockCaCertificate,
  mockClientCertificate,
} from 'src/__mocks__/certificates';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { ConnectionType, DatabaseEntity } from 'src/modules/database/entities/database.entity';
import { EncryptionStrategy } from 'src/modules/encryption/models';
import { mockIORedisClient } from 'src/__mocks__/redis';

export const mockDatabaseId = 'a77b23c1-7816-4ea4-b61f-d37795a0f805-db-id';

export const mockDatabasePasswordEncrypted = 'database.password_ENCRYPTED';

export const mockDatabasePasswordPlain = 'some pass';

export const mockDatabaseSentinelMasterPasswordEncrypted = 'database.sentinelMasterPassword_ENCRYPTED';

export const mockDatabaseSentinelMasterPasswordPlain = 'some sentinel pass';

export const mockDatabase = Object.assign(new Database(), {
  id: mockDatabaseId,
  name: 'database-name',
  host: 'localhost',
  port: 3679,
  connectionType: ConnectionType.STANDALONE,
});

export const mockDatabaseEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabase,
  encryption: null,
});

export const mockDatabaseWithAuth = Object.assign(new Database(), {
  ...mockDatabase,
  username: 'some username',
  password: mockDatabasePasswordPlain,
});

export const mockDatabaseWithAuthEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabaseWithAuth,
  password: mockDatabasePasswordEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
});

export const mockDatabaseWithTls = Object.assign(new Database(), {
  ...mockDatabaseWithAuth,
  tls: true,
  verifyServerCert: true,
  tlsServername: 'some.local',
  caCert: mockCaCertificate,
});

export const mockDatabaseWithTlsEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabaseWithTls,
  password: mockDatabasePasswordEncrypted,
  encryption: EncryptionStrategy.KEYTAR,
  caCert: mockCaCertificate, // !not client ca entity since it managed on own repository
});

export const mockDatabaseWithTlsAuth = Object.assign(new Database(), {
  ...mockDatabaseWithTls,
  clientCert: mockClientCertificate,
});

export const mockDatabaseWithTlsAuthEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabaseWithTlsEntity,
  clientCert: mockClientCertificate, // !not client cert entity since it managed on own repository
});

export const mockSentinelMaster = Object.assign(new SentinelMaster(), {
  name: 'master_group_name',
  username: 'master_group_username',
  password: mockDatabaseSentinelMasterPasswordPlain,
});

export const mockSentinelDatabaseWithTlsAuth = Object.assign(new Database(), {
  ...mockDatabaseWithTlsAuth,
  sentinelMaster: mockSentinelMaster,
  connectionType: ConnectionType.SENTINEL,
});

export const mockSentinelDatabaseWithTlsAuthEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabaseWithTlsAuthEntity,
  sentinelMasterName: mockSentinelMaster.name,
  sentinelMasterUsername: mockSentinelMaster.username,
  sentinelMasterPassword: mockDatabaseSentinelMasterPasswordEncrypted,
  connectionType: ConnectionType.SENTINEL,
});

export const mockClusterDatabaseWithTlsAuth = Object.assign(new Database(), {
  ...mockDatabaseWithTlsAuth,
  connectionType: ConnectionType.CLUSTER,
});

export const mockClusterDatabaseWithTlsAuthEntity = Object.assign(new DatabaseEntity(), {
  ...mockDatabaseWithTlsAuthEntity,
  connectionType: ConnectionType.CLUSTER,
});

export const mockDatabaseService = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockDatabase),
  create: jest.fn().mockResolvedValue(mockDatabase),
  list: jest.fn(),
}));

export const mockDatabaseConnectionService = jest.fn(() => ({
  getOrCreateClient: jest.fn().mockResolvedValue(mockIORedisClient),
}));
