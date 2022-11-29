import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionOptions } from 'tls';
import {
  mockCaCertificate, mockClientCertificate, mockClusterDatabaseWithTlsAuth, mockDatabase,
  mockDatabaseEntity, mockIORedisClient, mockIORedisCluster, mockIORedisSentinel, mockSentinelDatabaseWithTlsAuth,
} from 'src/__mocks__';
import { AppTool } from 'src/models';
import { ClientContext, ClientMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { RedisService } from './redis.service';

const mockRedisClientInstance = {
  session: undefined,
  databaseId: mockDatabase.id,
  context: ClientContext.Common,
  uniqueId: undefined,
  client: mockIORedisClient,
  lastTimeUsed: Date.now(),
};

const mockTlsConfigResult: ConnectionOptions = {
  rejectUnauthorized: true,
  servername: mockDatabaseEntity.tlsServername,
  checkServerIdentity: () => undefined,
  ca: [mockCaCertificate.certificate],
  key: mockClientCertificate.key,
  cert: mockClientCertificate.certificate,
};

const removeNullsFromDto = (dto): any => {
  const result = dto;
  Object.keys(dto).forEach((key: string) => {
    if (result[key] === null) {
      delete result[key];
    }
  });

  return result;
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
      ],
    }).compile();

    service = await module.get(RedisService);
  });

  it('should be defined', () => {
    expect(service.clients).toEqual([]);
  });

  describe('connectToDatabaseInstance', () => {
    beforeEach(async () => {
      service.clients = [];
    });
    it('should create standalone client', async () => {
      service.createStandaloneClient = jest.fn().mockResolvedValue(mockIORedisClient);

      const result = await service.connectToDatabaseInstance(mockDatabase);

      expect(result).toEqual(mockIORedisClient);
      expect(service.createStandaloneClient).toHaveBeenCalledWith(mockDatabase, AppTool.Common, true, undefined);
    });
    it('should create standalone client (by default)', async () => {
      service.createStandaloneClient = jest.fn().mockResolvedValue(mockIORedisClient);
      const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
        ...mockDatabase,
        connectionType: null,
      });

      const result = await service.connectToDatabaseInstance(mockDatabaseWithoutConnectionType);

      expect(result).toEqual(mockIORedisClient);
      expect(service.createStandaloneClient)
        .toHaveBeenCalledWith({
          ...mockDatabaseWithoutConnectionType,
          connectionType: undefined,
        }, AppTool.Common, true, undefined);
    });
    it('should create cluster client', async () => {
      service.createClusterClient = jest.fn().mockResolvedValue(mockIORedisCluster);

      const result = await service.connectToDatabaseInstance(mockClusterDatabaseWithTlsAuth);

      expect(result).toEqual(mockIORedisCluster);
      expect(service.createClusterClient).toHaveBeenCalledWith(
        mockClusterDatabaseWithTlsAuth,
        mockClusterDatabaseWithTlsAuth.nodes,
        true,
        undefined,
      );
    });
    it('should create sentinel client', async () => {
      const dto = removeNullsFromDto(mockSentinelDatabaseWithTlsAuth);
      Object.keys(dto).forEach((key: string) => {
        if (dto[key] === null) {
          delete dto[key];
        }
      });
      const { nodes } = dto;
      service.createSentinelClient = jest.fn().mockResolvedValue(mockIORedisSentinel);

      const result = await service.connectToDatabaseInstance(dto);

      expect(result).toEqual(mockIORedisSentinel);
      expect(service.createSentinelClient).toHaveBeenCalledWith(
        mockSentinelDatabaseWithTlsAuth,
        nodes,
        ClientContext.Common,
        true,
        undefined,
      );
    });
  });

  describe('getClientInstance', () => {
    beforeEach(() => {
      service.clients = [
        {
          ...mockRedisClientInstance,
        },
        {
          ...mockRedisClientInstance, context: ClientContext.Browser,
        },
        {
          ...mockRedisClientInstance, context: ClientContext.CLI,
        },
      ];
    });
    it('should correctly find client instance for App.Common by instance id', () => {
      const newClient = { ...service.clients[0], context: ClientContext.Browser };
      service.clients.push(newClient);
      const options = {
        session: undefined,
        databaseId: newClient.databaseId,
        context: ClientContext.Common,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(service.clients[0]);
    });
    it('should correctly find client instance by instance id and tool', () => {
      const options = {
        session: undefined,
        databaseId: service.clients[0].databaseId,
        context: ClientContext.CLI,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(service.clients[2]);
    });
    it('should correctly find client instance by instance id, tool and uuid', () => {
      const newClient = { ...mockRedisClientInstance, uniqueId: uuidv4(), context: ClientContext.CLI };
      service.clients.push(newClient);

      const options = {
        session: undefined,
        databaseId: newClient.databaseId,
        uniqueId: newClient.uniqueId,
        context: newClient.context,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(newClient);
    });
    it('should return undefined', () => {
      const options = {
        session: undefined,
        databaseId: 'invalid-instance-id',
        context: ClientContext.Common,
      };

      const result = service.getClientInstance(options);

      expect(result).toBeUndefined();
    });
  });

  describe('removeClientInstance', () => {
    beforeEach(() => {
      service.clients = [
        {
          ...mockRedisClientInstance,
        },
        {
          ...mockRedisClientInstance, context: ClientContext.Browser,
        },
      ];
    });
    it('should remove only client for browser tool', () => {
      const options = {
        databaseId: mockRedisClientInstance.databaseId,
        context: ClientContext.Browser,
      };

      const result = service.removeClientInstance(options);

      expect(result).toEqual(1);
      expect(service.clients.length).toEqual(1);
    });
    it('should remove all clients by instance id', () => {
      const options = {
        databaseId: mockRedisClientInstance.databaseId,
      };

      const result = service.removeClientInstance(options);

      expect(result).toEqual(2);
      expect(service.clients.length).toEqual(0);
    });
  });

  describe('setClientInstance', () => {
    beforeEach(() => {
      service.clients = [{ ...mockRedisClientInstance }];
    });
    it('should add new client', () => {
      const initialClientsCount = service.clients.length;
      const newClientInstance: ClientMetadata = {
        ...mockRedisClientInstance,
        databaseId: uuidv4(),
      };

      const result = service.setClientInstance(newClientInstance, mockIORedisClient);

      expect(result).toBe(1);
      expect(service.clients.length).toBe(initialClientsCount + 1);
    });
    it('should replace exist client', () => {
      const initialClientsCount = service.clients.length;

      const result = service.setClientInstance(mockRedisClientInstance, mockIORedisClient);

      expect(result).toBe(0);
      expect(service.clients.length).toBe(initialClientsCount);
    });
  });

  describe('isClientConnected', () => {
    it('should return true', async () => {
      const result = service.isClientConnected(mockIORedisClient);

      expect(result).toEqual(true);
    });
    it('should return false', async () => {
      const mockClient = { ...mockIORedisClient };
      mockClient.status = 'end';

      const result = service.isClientConnected(mockClient);

      expect(result).toEqual(false);
    });
  });

  describe('getRedisConnectionConfig', () => {
    it('should return config with tls', async () => {
      service['getTLSConfig'] = jest.fn().mockResolvedValue(mockTlsConfigResult);
      const {
        host, port, password, username, db,
      } = mockClusterDatabaseWithTlsAuth;

      const expectedResult = {
        host, port, username, password, db, tls: mockTlsConfigResult,
      };

      const result = await service['getRedisConnectionConfig'](mockClusterDatabaseWithTlsAuth);

      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
    });
    it('should return without tls', async () => {
      const {
        host, port, password, username, db,
      } = mockDatabase;

      const expectedResult = {
        host, port, username, password, db,
      };

      const result = await service['getRedisConnectionConfig'](mockDatabase);

      expect(result).toEqual(expectedResult);
    });
  });

  xdescribe('getTLSConfig', () => {
    it('should return tls config', async () => {
      const result = await service['getTLSConfig'](mockClusterDatabaseWithTlsAuth);

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify(mockTlsConfigResult),
      );
    });
  });
});
