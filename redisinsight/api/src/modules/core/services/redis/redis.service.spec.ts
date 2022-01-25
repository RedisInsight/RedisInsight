import { Test, TestingModule } from '@nestjs/testing';
import * as Redis from 'ioredis-mock';
import { v4 as uuidv4 } from 'uuid';
import { ConnectionOptions } from 'tls';
import {
  mockCaCertDto,
  mockCaCertEntity,
  mockCaCertificatesService,
  mockClientCertDto,
  mockClientCertEntity,
  mockClientCertificatesService,
  mockOSSClusterDatabaseEntity,
  mockSentinelDatabaseEntity,
  mockStandaloneDatabaseEntity,
  MockType,
} from 'src/__mocks__';
import { AppTool, ReplyError } from 'src/models';
import { convertEntityToDto } from 'src/modules/shared/utils/database-entity-converter';
import { mockRedisClientInstance } from 'src/modules/shared/services/base/redis-consumer.abstract.service.spec';
import { IFindRedisClientInstanceByOptions, RedisService } from './redis.service';
import { CaCertBusinessService } from '../certificates/ca-cert-business/ca-cert-business.service';
import { ClientCertBusinessService } from '../certificates/client-cert-business/client-cert-business.service';

jest.mock('ioredis');

const mockTlsConfigResult: ConnectionOptions = {
  rejectUnauthorized: true,
  checkServerIdentity: () => undefined,
  ca: [mockCaCertDto.cert],
  key: mockClientCertDto.key,
  cert: mockClientCertDto.cert,
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
  let service;
  let caCertBusinessService: MockType<CaCertBusinessService>;
  let clientCertBusinessService: MockType<ClientCertBusinessService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CaCertBusinessService,
          useFactory: mockCaCertificatesService,
        },
        {
          provide: ClientCertBusinessService,
          useFactory: mockClientCertificatesService,
        },
      ],
    }).compile();

    service = await module.get<RedisService>(RedisService);
    caCertBusinessService = module.get(CaCertBusinessService);
    clientCertBusinessService = module.get(ClientCertBusinessService);
  });

  it('should be defined', () => {
    expect(service.clients).toEqual([]);
  });

  describe('connectToDatabaseInstance', () => {
    beforeEach(async () => {
      service.clients = [];
    });
    it('should create standalone client', async () => {
      const mockClient = new Redis();
      const dto = convertEntityToDto(mockStandaloneDatabaseEntity);
      service.createStandaloneClient = jest.fn().mockResolvedValue(mockClient);

      const result = await service.connectToDatabaseInstance(dto);

      expect(result).toEqual(mockClient);
      expect(service.createStandaloneClient).toHaveBeenCalledWith(dto, AppTool.Common, true, undefined);
    });
    it('should create cluster client', async () => {
      const mockClient = new Redis.Cluster([
        'redis://localhost:7001',
        'redis://localhost:7002',
      ]);
      const dto = removeNullsFromDto(convertEntityToDto(mockOSSClusterDatabaseEntity));

      const { endpoints, connectionType, ...options } = dto;
      service.createClusterClient = jest.fn().mockResolvedValue(mockClient);

      const result = await service.connectToDatabaseInstance(dto);

      expect(result).toEqual(mockClient);
      expect(service.createClusterClient).toHaveBeenCalledWith(
        options,
        endpoints,
        true,
        undefined,
      );
    });
    it('should create sentinel client', async () => {
      const mockClient = new Redis();
      const dto = removeNullsFromDto(convertEntityToDto(mockSentinelDatabaseEntity));
      Object.keys(dto).forEach((key: string) => {
        if (dto[key] === null) {
          delete dto[key];
        }
      });
      const { endpoints, connectionType, ...options } = dto;
      service.createSentinelClient = jest.fn().mockResolvedValue(mockClient);

      const result = await service.connectToDatabaseInstance(dto);

      expect(result).toEqual(mockClient);
      expect(service.createSentinelClient).toHaveBeenCalledWith(
        options,
        endpoints,
        AppTool.Common,
        true,
        undefined,
      );
    });
    it('should select redis database by number', async () => {
      const mockClient = new Redis();
      mockClient.send_command = jest.fn();
      const dto = convertEntityToDto(mockStandaloneDatabaseEntity);
      service.createStandaloneClient = jest.fn().mockResolvedValue(mockClient);

      await service.connectToDatabaseInstance(dto, AppTool.Common);

      expect(service.createStandaloneClient).toHaveBeenCalledWith(dto, AppTool.Common, true, undefined);
    });
    it('should throw error db index is out of range', async () => {
      const replyError: ReplyError = {
        name: 'ReplyError',
        message: '(error) DB index is out of range',
        command: 'SELECT',
      };
      service.createStandaloneClient = jest.fn().mockRejectedValue(replyError);

      try {
        await service.connectToDatabaseInstance(
          convertEntityToDto(mockStandaloneDatabaseEntity),
        );
        fail('Should throw an error');
      } catch (err) {
        expect(err).toEqual(replyError);
      }
      expect(service.clients.length).toEqual(0);
    });
    it('connection error [Connection details are incorrect]', async () => {
      service.createStandaloneClient = jest
        .fn()
        .mockRejectedValue(new Error('ENOTFOUND some message'));

      try {
        await service.connectToDatabaseInstance(
          convertEntityToDto(mockStandaloneDatabaseEntity),
          0,
        );
        fail('Should throw an error');
      } catch (err) {
        expect(err.message).toEqual('ENOTFOUND some message');
        expect(service.clients.length).toEqual(0);
      }
    });
  });

  describe('getClientInstance', () => {
    beforeEach(() => {
      service.clients = [
        {
          ...mockRedisClientInstance, tool: AppTool.Common,
        },
        {
          ...mockRedisClientInstance, tool: AppTool.Browser,
        },
        {
          ...mockRedisClientInstance, tool: AppTool.CLI,
        },
      ];
    });
    it('should correctly find client instance for App.Common by instance id', () => {
      const newClient = { ...service.clients[0], tool: AppTool.Browser };
      service.clients.push(newClient);
      const options = {
        instanceId: newClient.instanceId,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(service.clients[0]);
    });
    it('should correctly find client instance by instance id and tool', () => {
      const options: IFindRedisClientInstanceByOptions = {
        instanceId: service.clients[0].instanceId,
        tool: AppTool.CLI,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(service.clients[2]);
    });
    it('should correctly find client instance by instance id, tool and uuid', () => {
      const newClient = { ...mockRedisClientInstance, uuid: uuidv4(), tool: AppTool.CLI };
      service.clients.push(newClient);
      const options: IFindRedisClientInstanceByOptions = {
        instanceId: newClient.instanceId,
        uuid: newClient.uuid,
        tool: newClient.tool,
      };

      const result = service.getClientInstance(options);

      expect(result).toEqual(newClient);
    });
    it('should return undefined', () => {
      const options: IFindRedisClientInstanceByOptions = {
        instanceId: 'invalid-instance-id',
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
          tool: AppTool.Common,
        },
        {
          ...mockRedisClientInstance,
          tool: AppTool.Browser,
        },
      ];
    });
    it('should remove only client for browser tool', () => {
      const options: IFindRedisClientInstanceByOptions = {
        instanceId: mockRedisClientInstance.instanceId,
        tool: AppTool.Browser,
      };

      const result = service.removeClientInstance(options);

      expect(result).toEqual(1);
      expect(service.clients.length).toEqual(1);
    });
    it('should remove all clients by instance id', () => {
      const options: IFindRedisClientInstanceByOptions = {
        instanceId: mockRedisClientInstance.instanceId,
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
      const newClientInstance = {
        ...mockRedisClientInstance,
        instanceId: uuidv4(),
      };

      const result = service.setClientInstance(newClientInstance);

      expect(result).toBe(1);
      expect(service.clients.length).toBe(initialClientsCount + 1);
    });
    it('should replace exist client', () => {
      const initialClientsCount = service.clients.length;

      const result = service.setClientInstance(mockRedisClientInstance);

      expect(result).toBe(0);
      expect(service.clients.length).toBe(initialClientsCount);
    });
  });

  describe('isClientConnected', () => {
    const mockClient = new Redis();
    it('should return true', async () => {
      mockClient.status = 'ready';

      const result = service.isClientConnected(mockClient);

      expect(result).toEqual(true);
    });
    it('should return false', async () => {
      mockClient.status = 'end';

      const result = service.isClientConnected(mockClient);

      expect(result).toEqual(false);
    });
  });

  describe('getRedisConnectionConfig', () => {
    it('should return config with tls', async () => {
      service.getTLSConfig = jest.fn().mockResolvedValue(mockTlsConfigResult);
      const dto = convertEntityToDto(mockStandaloneDatabaseEntity);
      const {
        host, port, password, username, db,
      } = dto;

      const expectedResult = {
        host, port, username, password, db, tls: mockTlsConfigResult,
      };

      const result = await service.getRedisConnectionConfig(dto);

      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
    });
    it('should return without tls', async () => {
      const dto = convertEntityToDto(mockStandaloneDatabaseEntity);
      delete dto.tls;
      const {
        host, port, password, username, db,
      } = dto;

      const expectedResult = {
        host, port, username, password, db,
      };

      const result = await service.getRedisConnectionConfig(dto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTLSConfig', () => {
    it('should return tls config', async () => {
      service.getCaCertConfig = jest
        .fn()
        .mockResolvedValue({ ca: [mockCaCertDto.cert] });
      service.getClientCertConfig = jest.fn().mockResolvedValue({
        key: mockClientCertDto.key,
        cert: mockClientCertDto.cert,
      });
      const { tls } = convertEntityToDto(mockStandaloneDatabaseEntity);

      const result = await service.getTLSConfig(tls);

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify(mockTlsConfigResult),
      );
    });
  });

  describe('getCaCertConfig', () => {
    it('should load exist cert', async () => {
      caCertBusinessService.getOneById = jest
        .fn()
        .mockResolvedValue(mockCaCertEntity);
      const { tls } = convertEntityToDto(mockStandaloneDatabaseEntity);

      const result = await service.getCaCertConfig(tls);

      expect(result).toEqual({ ca: [mockCaCertDto.cert] });
      expect(caCertBusinessService.getOneById).toHaveBeenCalledWith(
        tls.caCertId,
      );
    });
    it('should return new cert', async () => {
      const result = await service.getCaCertConfig({
        newCaCert: mockCaCertDto,
      });

      expect(result).toEqual({ ca: [mockCaCertDto.cert] });
      expect(caCertBusinessService.getOneById).not.toHaveBeenCalled();
    });
    it('should return null', async () => {
      const result = await service.getCaCertConfig({});

      expect(result).toBeNull();
    });
  });

  describe('getClientCertConfig', () => {
    const mockResult = {
      key: mockClientCertDto.key,
      cert: mockClientCertDto.cert,
    };
    it('should load exist cert', async () => {
      clientCertBusinessService.getOneById = jest
        .fn()
        .mockResolvedValue(mockClientCertEntity);
      const { tls } = convertEntityToDto(mockStandaloneDatabaseEntity);

      const result = await service.getClientCertConfig(tls);

      expect(result).toEqual(mockResult);
      expect(clientCertBusinessService.getOneById).toHaveBeenCalledWith(
        tls.clientCertPairId,
      );
    });
    it('should return new cert', async () => {
      const result = await service.getClientCertConfig({
        newClientCertPair: mockClientCertDto,
      });

      expect(result).toEqual(mockResult);
      expect(clientCertBusinessService.getOneById).not.toHaveBeenCalled();
    });
    it('should return null', async () => {
      const result = await service.getClientCertConfig({});

      expect(result).toBeNull();
    });
  });
});
