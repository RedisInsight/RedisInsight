import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionOptions } from 'tls';
import {
  generateMockRedisClientInstance,
  mockCaCertificate,
  mockClientCertificate,
  mockDatabase,
  mockDatabaseEntity,
  mockIORedisClient,
  mockRedisConnectionFactory
} from 'src/__mocks__';
import { ClientContext, Session } from 'src/common/models';
import { RedisService } from './redis.service';
import { RedisConnectionFactory } from 'src/modules/redis/redis-connection.factory';

const mockClientMetadata = {
  session: {
    id: 'sessionId',
  },
};

const mockRedisClientInstance = {
  clientMetadata: {},
  session: {},
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
        {
          provide: RedisConnectionFactory,
          useFactory: mockRedisConnectionFactory,
        },
      ],
    }).compile();

    service = await module.get(RedisService);
  });

  it('should be defined', () => {
    expect(service.clients).toEqual(new Map());
  });

  // describe('connectToDatabaseInstance', () => {
  //   beforeEach(async () => {
  //     service.clients = new Map();
  //   });
  //   it('should create standalone client', async () => {
  //     service.createStandaloneClient = jest.fn().mockResolvedValue(mockIORedisClient);
  //
  //     const result = await service.connectToDatabaseInstance(mockDatabase);
  //
  //     expect(result).toEqual(mockIORedisClient);
  //     expect(service.createStandaloneClient).toHaveBeenCalledWith(mockDatabase, AppTool.Common, true, undefined);
  //   });
  //   it('should create standalone client (by default)', async () => {
  //     service.createStandaloneClient = jest.fn().mockResolvedValue(mockIORedisClient);
  //     const mockDatabaseWithoutConnectionType = Object.assign(new Database(), {
  //       ...mockDatabase,
  //       connectionType: null,
  //     });
  //
  //     const result = await service.connectToDatabaseInstance(mockDatabaseWithoutConnectionType);
  //
  //     expect(result).toEqual(mockIORedisClient);
  //     expect(service.createStandaloneClient)
  //       .toHaveBeenCalledWith({
  //         ...mockDatabaseWithoutConnectionType,
  //         connectionType: undefined,
  //       }, AppTool.Common, true, undefined);
  //   });
  //   it('should create cluster client', async () => {
  //     service.createClusterClient = jest.fn().mockResolvedValue(mockIORedisCluster);
  //
  //     const result = await service.connectToDatabaseInstance(mockClusterDatabaseWithTlsAuth);
  //
  //     expect(result).toEqual(mockIORedisCluster);
  //     expect(service.createClusterClient).toHaveBeenCalledWith(
  //       mockClusterDatabaseWithTlsAuth,
  //       mockClusterDatabaseWithTlsAuth.nodes,
  //       true,
  //       undefined,
  //     );
  //   });
  //   it('should create sentinel client', async () => {
  //     const dto = removeNullsFromDto(mockSentinelDatabaseWithTlsAuth);
  //     Object.keys(dto).forEach((key: string) => {
  //       if (dto[key] === null) {
  //         delete dto[key];
  //       }
  //     });
  //     const { nodes } = dto;
  //     service.createSentinelClient = jest.fn().mockResolvedValue(mockIORedisSentinel);
  //
  //     const result = await service.connectToDatabaseInstance(dto);
  //
  //     expect(result).toEqual(mockIORedisSentinel);
  //     expect(service.createSentinelClient).toHaveBeenCalledWith(
  //       mockSentinelDatabaseWithTlsAuth,
  //       nodes,
  //       ClientContext.Common,
  //       true,
  //       undefined,
  //     );
  //   });
  // });

  // describe('getClientInstance', () => {
  //   beforeEach(() => {
  //     service.clients = [
  //       {
  //         ...mockRedisClientInstance,
  //       },
  //       {
  //         ...mockRedisClientInstance, context: ClientContext.Browser,
  //       },
  //       {
  //         ...mockRedisClientInstance, context: ClientContext.CLI,
  //       },
  //     ];
  //   });
  //   it('should correctly find client instance for App.Common by instance id', () => {
  //     const newClient = { ...service.clients[0], context: ClientContext.Browser };
  //     service.clients.push(newClient);
  //     const options = {
  //       session: undefined,
  //       databaseId: newClient.databaseId,
  //       context: ClientContext.Common,
  //     };
  //
  //     const result = service.getClientInstance(options);
  //
  //     expect(result).toEqual(service.clients[0]);
  //   });
  //   it('should correctly find client instance by instance id and tool', () => {
  //     const options = {
  //       session: undefined,
  //       databaseId: service.clients[0].databaseId,
  //       context: ClientContext.CLI,
  //     };
  //
  //     const result = service.getClientInstance(options);
  //
  //     expect(result).toEqual(service.clients[2]);
  //   });
  //   it('should correctly find client instance by instance id, tool and uuid', () => {
  //     const newClient = { ...mockRedisClientInstance, uniqueId: uuidv4(), context: ClientContext.CLI };
  //     service.clients.push(newClient);
  //
  //     const options = {
  //       session: undefined,
  //       databaseId: newClient.databaseId,
  //       uniqueId: newClient.uniqueId,
  //       context: newClient.context,
  //     };
  //
  //     const result = service.getClientInstance(options);
  //
  //     expect(result).toEqual(newClient);
  //   });
  //   it('should return undefined', () => {
  //     const options = {
  //       session: undefined,
  //       databaseId: 'invalid-instance-id',
  //       context: ClientContext.Common,
  //     };
  //
  //     const result = service.getClientInstance(options);
  //
  //     expect(result).toBeUndefined();
  //   });
  // });

  describe('findClientInstances + removeClientInstances', () => {
    const mockClientMetadata1 = {
      session: {
        userId: 'u1',
        sessionId: 's1',
      },
      databaseId: mockDatabase.id,
      context: ClientContext.Common,
    };

    const mockRedisClientInstance1 = generateMockRedisClientInstance(mockClientMetadata1);
    const mockRedisClientInstance2 = generateMockRedisClientInstance({
      ...mockClientMetadata1,
      context: ClientContext.Browser,
      db: 0,
    });
    const mockRedisClientInstance3 = generateMockRedisClientInstance({
      ...mockClientMetadata1,
      session: { userId: 'u2', sessionId: 's2' },
      context: ClientContext.Workbench,
      db: 1,
    });
    const mockRedisClientInstance4 = generateMockRedisClientInstance({
      ...mockClientMetadata1,
      session: { userId: 'u2', sessionId: 's3' },
      db: 2,
    });
    const mockRedisClientInstance5 = generateMockRedisClientInstance({
      ...mockClientMetadata1,
      databaseId: 'd2',
      session: { userId: 'u2', sessionId: 's4' },
    });

    beforeEach(() => {
      service.clients = new Map();
      service.clients.set(mockRedisClientInstance1.id, mockRedisClientInstance1);
      service.clients.set(mockRedisClientInstance2.id, mockRedisClientInstance2);
      service.clients.set(mockRedisClientInstance3.id, mockRedisClientInstance3);
      service.clients.set(mockRedisClientInstance4.id, mockRedisClientInstance4);
      service.clients.set(mockRedisClientInstance5.id, mockRedisClientInstance5);
    });
    it('should correctly find client instances for particular database', () => {
      const query = {
        databaseId: mockDatabase.id,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(4);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
      });

      expect(service.removeClientInstances(query)).toEqual(4);
      expect(service.clients.size).toEqual(1);
    });
    it('should correctly find client instances for particular database and context', () => {
      const query = {
        databaseId: mockDatabase.id,
        context: ClientContext.Browser,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(1);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.context).toEqual(query.context);
      });

      expect(service.removeClientInstances(query)).toEqual(1);
      expect(service.clients.size).toEqual(4);
    });
    xit('should correctly find client instances for particular database and user', () => {
      const query = {
        session: { userId: 'u1' } as Session,
        databaseId: mockDatabase.id,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(2);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.session.userId).toEqual(query.session.userId);
      });

      expect(service.removeClientInstances(query)).toEqual(2);
      expect(service.clients.size).toEqual(3);
    });
    xit('should correctly find client instances for particular user', () => {
      const query = {
        session: { userId: 'u2' } as Session,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(3);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.session.userId).toEqual(query.session.userId);
      });
      expect(result[0].clientMetadata.databaseId).toEqual(mockDatabase.id);
      expect(result[2].clientMetadata.databaseId).toEqual('d2');

      expect(service.removeClientInstances(query)).toEqual(3);
      expect(service.clients.size).toEqual(2);
    });
    it('should correctly find client instances for particular database and db index', () => {
      const query = {
        databaseId: mockDatabase.id,
        db: 0,
      };

      const result = service.findClientInstances(query);

      expect(result.length).toEqual(1);
      result.forEach((clientInstance) => {
        expect(clientInstance.clientMetadata.databaseId).toEqual(query.databaseId);
        expect(clientInstance.clientMetadata.context).toEqual(ClientContext.Browser);
        expect(clientInstance.clientMetadata.db).toEqual(query.db);
      });

      expect(service.removeClientInstances(query)).toEqual(1);
      expect(service.clients.size).toEqual(4);
    });
    it('should not find any instances', () => {
      const query = {
        databaseId: 'not existing',
      };

      const result = service.findClientInstances(query);

      expect(result).toEqual([]);

      expect(service.removeClientInstances(query)).toEqual(0);
      expect(service.clients.size).toEqual(5);
    });
  });
  //
  // describe('removeClientInstance', () => {
  //   beforeEach(() => {
  //     service.clients = [
  //       {
  //         ...mockRedisClientInstance,
  //       },
  //       {
  //         ...mockRedisClientInstance, context: ClientContext.Browser,
  //       },
  //     ];
  //   });
  //   it('should remove only client for browser tool', () => {
  //     const options = {
  //       databaseId: mockRedisClientInstance.databaseId,
  //       context: ClientContext.Browser,
  //     };
  //
  //     const result = service.removeClientInstance(options);
  //
  //     expect(result).toEqual(1);
  //     expect(service.clients.length).toEqual(1);
  //   });
  //   it('should remove all clients by instance id', () => {
  //     const options = {
  //       databaseId: mockRedisClientInstance.databaseId,
  //     };
  //
  //     const result = service.removeClientInstance(options);
  //
  //     expect(result).toEqual(2);
  //     expect(service.clients.length).toEqual(0);
  //   });
  // });
  //
  // describe('setClientInstance', () => {
  //   beforeEach(() => {
  //     service.clients = [{ ...mockRedisClientInstance }];
  //   });
  //   it('should add new client', () => {
  //     const initialClientsCount = service.clients.length;
  //     const newClientInstance: ClientMetadata = {
  //       ...mockRedisClientInstance,
  //       databaseId: uuidv4(),
  //     };
  //
  //     const result = service.setClientInstance(newClientInstance, mockIORedisClient);
  //
  //     expect(result).toBe(1);
  //     expect(service.clients.length).toBe(initialClientsCount + 1);
  //   });
  //   it('should replace exist client', () => {
  //     const initialClientsCount = service.clients.length;
  //
  //     const result = service.setClientInstance(mockRedisClientInstance, mockIORedisClient);
  //
  //     expect(result).toBe(0);
  //     expect(service.clients.length).toBe(initialClientsCount);
  //   });
  // });
  //
  // describe('isClientConnected', () => {
  //   it('should return true', async () => {
  //     const result = service.isClientConnected(mockIORedisClient);
  //
  //     expect(result).toEqual(true);
  //   });
  //   it('should return false', async () => {
  //     const mockClient = { ...mockIORedisClient };
  //     mockClient.status = 'end';
  //
  //     const result = service.isClientConnected(mockClient);
  //
  //     expect(result).toEqual(false);
  //   });
  // });
  //
  // describe('getRedisConnectionConfig', () => {
  //   it('should return config with tls', async () => {
  //     service['getTLSConfig'] = jest.fn().mockResolvedValue(mockTlsConfigResult);
  //     const {
  //       host, port, password, username, db,
  //     } = mockClusterDatabaseWithTlsAuth;
  //
  //     const expectedResult = {
  //       host, port, username, password, db, tls: mockTlsConfigResult,
  //     };
  //
  //     const result = await service['getRedisConnectionConfig'](mockClusterDatabaseWithTlsAuth);
  //
  //     expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
  //   });
  //   it('should return without tls', async () => {
  //     const {
  //       host, port, password, username, db,
  //     } = mockDatabase;
  //
  //     const expectedResult = {
  //       host, port, username, password, db,
  //     };
  //
  //     const result = await service['getRedisConnectionConfig'](mockDatabase);
  //
  //     expect(result).toEqual(expectedResult);
  //   });
  // });
  //
  // xdescribe('getTLSConfig', () => {
  //   it('should return tls config', async () => {
  //     const result = await service['getTLSConfig'](mockClusterDatabaseWithTlsAuth);
  //
  //     expect(JSON.stringify(result)).toEqual(
  //       JSON.stringify(mockTlsConfigResult),
  //     );
  //   });
  // });
});
