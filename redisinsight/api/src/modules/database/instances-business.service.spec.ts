import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  GatewayTimeoutException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { filter } from 'lodash';
import { Repository } from 'typeorm';
import * as Redis from 'ioredis-mock';
import {
  mockCaCertEntity,
  mockClientCertEntity,
  mockDatabasesProvider,
  mockInstancesAnalyticsService,
  mockRepository,
  mockSentinelDatabaseEntity,
  mockStandaloneDatabaseEntity,
  MockType,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  DatabaseInstanceEntity,
  HostingProvider,
} from 'src/modules/core/models/database-instance.entity';
import {
  AddDatabaseInstanceDto,
  DatabaseInstanceResponse,
  RenameDatabaseInstanceResponse,
} from 'src/modules/instances/dto/database-instance.dto';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import {
  CaCertBusinessService,
} from 'src/modules/core/services/certificates/ca-cert-business/ca-cert-business.service';
import {
  ClientCertBusinessService,
} from 'src/modules/core/services/certificates/client-cert-business/client-cert-business.service';
import { AppTool } from 'src/models';
import {
  AddSentinelMasterDto,
  AddSentinelMasterResponse,
  AddSentinelMastersDto,
} from 'src/modules/instances/dto/redis-sentinel.dto';
import { AddRedisDatabaseStatus } from 'src/modules/instances/dto/redis-enterprise-cluster.dto';
import { InstancesAnalyticsService } from 'src/modules/shared/services/instances-business/instances-analytics.service';
import { mockRedisClientInstance } from 'src/modules/shared/services/base/redis-consumer.abstract.service.spec';
import {
  mockRedisGeneralInfo,
} from 'src/modules/shared/services/configuration-business/configuration-business.service.spec';
import { DatabasesProvider } from 'src/modules/shared/services/instances-business/databases.provider';
import { KeytarUnavailableException } from 'src/modules/core/encryption/exceptions';
import { OverviewService } from 'src/modules/shared/services/instances-business/overview.service';
import { mockDatabaseOverview } from 'src/modules/shared/services/instances-business/overview.service.spec';
import { InstancesBusinessService } from './instances-business.service';
import { RedisEnterpriseBusinessService } from '../redis-enterprise-business/redis-enterprise-business.service';
import { RedisCloudBusinessService } from '../redis-cloud-business/redis-cloud-business.service';
import { ConfigurationBusinessService } from '../configuration-business/configuration-business.service';
import { RedisSentinelBusinessService } from '../redis-sentinel-business/redis-sentinel-business.service';

const addDatabaseDto: AddDatabaseInstanceDto = {
  host: mockStandaloneDatabaseEntity.host,
  port: mockStandaloneDatabaseEntity.port,
  db: mockStandaloneDatabaseEntity.db,
  name: mockStandaloneDatabaseEntity.name,
  username: mockStandaloneDatabaseEntity.username,
  password: mockStandaloneDatabaseEntity.password,
  tls: {
    verifyServerCert: true,
    caCertId: mockCaCertEntity.id,
    clientCertPairId: mockClientCertEntity.id,
    servername: mockStandaloneDatabaseEntity.tlsServername,
  },
};

const mockDatabaseDto: DatabaseInstanceResponse = {
  id: mockStandaloneDatabaseEntity.id,
  nameFromProvider: null,
  provider: HostingProvider.LOCALHOST,
  connectionType: mockStandaloneDatabaseEntity.connectionType,
  lastConnection: mockStandaloneDatabaseEntity.lastConnection,
  modules: [],
  ...addDatabaseDto,
};

const mockSentinelMasterDto: AddSentinelMasterDto = {
  alias: 'sentinel-database',
  name: 'maseter-group',
  username: mockStandaloneDatabaseEntity.username,
  password: mockStandaloneDatabaseEntity.password,
};

const mockAddSentinelMastersDto: AddSentinelMastersDto = {
  host: mockSentinelDatabaseEntity.host,
  port: mockSentinelDatabaseEntity.port,
  username: mockSentinelDatabaseEntity.username,
  password: mockSentinelDatabaseEntity.password,
  tls: {
    verifyServerCert: true,
    caCertId: mockCaCertEntity.id,
    clientCertPairId: mockClientCertEntity.id,
  },
  masters: [mockSentinelMasterDto],
};

const mockAddSentinelMasterSuccessResponse: AddSentinelMasterResponse[] = [
  {
    id: mockSentinelDatabaseEntity.id,
    name: mockSentinelMasterDto.name,
    status: AddRedisDatabaseStatus.Success,
    message: 'Added',
  },
];

const mockAddSentinelMasterFailResponse: AddSentinelMasterResponse[] = [
  {
    name: mockSentinelMasterDto.name,
    status: AddRedisDatabaseStatus.Fail,
    message: ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST,
    error: new NotFoundException(
      ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST,
    ).getResponse(),
  },
];

describe('InstancesBusinessService', () => {
  let service: InstancesBusinessService;
  let instanceRepository: MockType<Repository<DatabaseInstanceEntity>>;
  let databasesProvider: MockType<DatabasesProvider>;
  let redisService;
  let redisConfBusinessService;
  let overviewService: MockType<OverviewService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstancesBusinessService,
        EventEmitter2,
        {
          provide: RedisSentinelBusinessService,
          useFactory: () => ({}),
        },
        {
          provide: RedisEnterpriseBusinessService,
          useFactory: () => ({}),
        },
        {
          provide: RedisCloudBusinessService,
          useFactory: () => ({}),
        },
        {
          provide: OverviewService,
          useFactory: () => ({
            getOverview: jest.fn(),
          }),
        },
        {
          provide: InstancesAnalyticsService,
          useFactory: mockInstancesAnalyticsService,
        },
        {
          provide: getRepositoryToken(DatabaseInstanceEntity),
          useFactory: mockRepository,
        },
        {
          provide: RedisService,
          useFactory: () => ({
            connectToDatabaseInstance: jest.fn(),
            createStandaloneClient: jest.fn(),
            setClientInstance: jest.fn(),
            isConnected: jest.fn(),
            removeClientInstance: jest.fn(),
          }),
        },
        {
          provide: ConfigurationBusinessService,
          useFactory: () => ({
            checkClusterConnection: jest.fn(),
            checkSentinelConnection: jest.fn(),
            getLoadedModulesList: jest.fn(),
            getRedisGeneralInfo: jest.fn().mockResolvedValue(mockRedisGeneralInfo),
          }),
        },
        { provide: CaCertBusinessService, useFactory: () => ({}) },
        { provide: ClientCertBusinessService, useFactory: () => ({}) },
        {
          provide: DatabasesProvider,
          useFactory: mockDatabasesProvider,
        },
      ],
    }).compile();

    service = await module.get<InstancesBusinessService>(
      InstancesBusinessService,
    );
    instanceRepository = await module.get(
      getRepositoryToken(DatabaseInstanceEntity),
    );
    redisConfBusinessService = await module.get<ConfigurationBusinessService>(
      ConfigurationBusinessService,
    );
    redisService = await module.get<RedisService>(RedisService);
    overviewService = await module.get(OverviewService);
    redisConfBusinessService.getLoadedModulesList.mockResolvedValue([]);
    databasesProvider = module.get(DatabasesProvider);
  });

  describe('exists', () => {
    it('should return true', async () => {
      databasesProvider.exists.mockResolvedValue(true);

      expect(await service.exists(mockDatabaseDto.id)).toEqual(true);
    });
  });

  describe('getAll', () => {
    it('get all database instances from the repository', async () => {
      databasesProvider.getAll.mockResolvedValue([mockStandaloneDatabaseEntity]);

      expect(await service.getAll()).toEqual([mockDatabaseDto]);
    });
  });

  describe('getOneById', () => {
    it('should return database instance', async () => {
      databasesProvider.getOneById.mockResolvedValue(mockStandaloneDatabaseEntity);

      expect(await service.getOneById(mockStandaloneDatabaseEntity.id)).toEqual(mockDatabaseDto);
    });
    it('should throw not found exception', async () => {
      databasesProvider.getOneById.mockRejectedValue(new NotFoundException());

      await expect(
        service.getOneById(mockStandaloneDatabaseEntity.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw KeytarUnavailable exception', async () => {
      databasesProvider.getOneById.mockRejectedValue(new KeytarUnavailableException());

      await expect(
        service.getOneById(mockStandaloneDatabaseEntity.id),
      ).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('addDatabase', () => {
    beforeEach(() => {
      service.getInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);
      service.createDatabaseEntity = jest
        .fn()
        .mockReturnValue(mockStandaloneDatabaseEntity);
    });
    describe('add Standalone database', () => {
      beforeEach(() => {
        redisConfBusinessService.checkSentinelConnection.mockReturnValue(false);
        redisConfBusinessService.checkClusterConnection.mockReturnValue(false);
      });

      it('successfully add the database instance', async () => {
        redisService.createStandaloneClient = jest
          .fn()
          .mockResolvedValue(new Redis());
        databasesProvider.save.mockResolvedValue(mockStandaloneDatabaseEntity);

        const result = await service.addDatabase(addDatabaseDto);

        expect(redisService.createStandaloneClient).toHaveBeenCalledWith(
          addDatabaseDto,
          AppTool.Common,
          false,
        );
        expect(databasesProvider.save).toHaveBeenCalledWith(
          mockStandaloneDatabaseEntity,
        );
        expect(result).toEqual(mockDatabaseDto);
      });

      it('should throw an error when unable to connect during database creation', async () => {
        redisService.createStandaloneClient = jest.fn().mockRejectedValue(
          new Error(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
        );

        await expect(service.addDatabase(addDatabaseDto)).rejects.toThrow(
          BadRequestException,
        );

        expect(instanceRepository.save).not.toHaveBeenCalled();
      });
      it('should throw KeytarUnavailable error', async () => {
        redisService.createStandaloneClient = jest
          .fn()
          .mockResolvedValue(new Redis());
        databasesProvider.save.mockRejectedValue(new KeytarUnavailableException());

        await expect(service.addDatabase(addDatabaseDto)).rejects.toThrow(
          KeytarUnavailableException,
        );
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.createDatabaseEntity = jest
        .fn()
        .mockReturnValue(mockStandaloneDatabaseEntity);
    });

    it('successfully update the database instance', async () => {
      redisService.createStandaloneClient = jest
        .fn()
        .mockResolvedValue(new Redis());
      databasesProvider.getOneById.mockResolvedValue(mockStandaloneDatabaseEntity);
      databasesProvider.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        mockStandaloneDatabaseEntity.id,
        mockDatabaseDto,
      );

      expect(databasesProvider.getOneById).toHaveBeenCalledWith(mockStandaloneDatabaseEntity.id);
      expect(redisService.createStandaloneClient).toHaveBeenCalledWith(
        mockDatabaseDto,
        AppTool.Common,
        false,
      );
      expect(databasesProvider.update).toHaveBeenCalled();
      expect(result).toEqual(mockDatabaseDto);
    });

    it('should throw an error when database not found during update', async () => {
      databasesProvider.getOneById.mockRejectedValue(new NotFoundException());

      await expect(
        service.update(mockStandaloneDatabaseEntity.id, addDatabaseDto),
      ).rejects.toThrow(NotFoundException);
      expect(databasesProvider.update).not.toHaveBeenCalled();
    });

    it('should throw an error when unable to connect during update', async () => {
      service.getOneById = jest
        .fn()
        .mockResolvedValue(mockStandaloneDatabaseEntity);
      redisService.createStandaloneClient = jest
        .fn()
        .mockRejectedValue(new Error(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB));

      await expect(
        service.update(mockStandaloneDatabaseEntity.id, addDatabaseDto),
      ).rejects.toThrow(BadRequestException);
      expect(databasesProvider.update).not.toHaveBeenCalled();
    });

    it('should throw KeytarUnavailable', async () => {
      databasesProvider.getOneById.mockResolvedValue(mockStandaloneDatabaseEntity);
      redisService.createStandaloneClient = jest.fn()
        .mockResolvedValue(new Redis());

      databasesProvider.update.mockRejectedValue(new KeytarUnavailableException());

      await expect(
        service.update(mockStandaloneDatabaseEntity.id, addDatabaseDto),
      ).rejects.toThrow(KeytarUnavailableException);
    });
  });

  describe('delete', () => {
    it('successfully delete the database instance', async () => {
      databasesProvider.getOneById.mockResolvedValue(
        mockStandaloneDatabaseEntity,
      );

      await service.delete(mockStandaloneDatabaseEntity.id);

      expect(instanceRepository.delete).toHaveBeenCalledWith(
        mockStandaloneDatabaseEntity.id,
      );
    });
    it('should throw an error when database not found during delete', async () => {
      databasesProvider.getOneById.mockRejectedValue(new NotFoundException());

      await expect(
        service.delete(mockStandaloneDatabaseEntity.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('successfully delete many database instances', async () => {
      const ids = [mockStandaloneDatabaseEntity.id];
      instanceRepository.findByIds.mockResolvedValue([
        mockStandaloneDatabaseEntity,
      ]);
      instanceRepository.remove.mockResolvedValue([
        { ...mockStandaloneDatabaseEntity, id: null },
      ]);

      const result = await service.bulkDelete(ids);

      expect(result).toEqual({ affected: ids.length });
    });
  });

  describe('connectToInstance', () => {
    beforeEach(() => {
      databasesProvider.getOneById.mockResolvedValue(mockStandaloneDatabaseEntity);
    });

    it('successfully connected to the redis database', async () => {
      await service.connectToInstance(
        mockStandaloneDatabaseEntity.id,
        AppTool.Common,
        true,
      );

      expect(databasesProvider.getOneById).toHaveBeenCalledWith(mockStandaloneDatabaseEntity.id);
      expect(redisService.connectToDatabaseInstance).toHaveBeenCalledWith(
        mockDatabaseDto,
        AppTool.Common,
        'redisinsight-common-a77b23c1',
      );
    });

    it('should throw an error when database not found during connecting', async () => {
      databasesProvider.getOneById.mockRejectedValue(new NotFoundException());

      await expect(
        service.connectToInstance(mockStandaloneDatabaseEntity.id, AppTool.Common),
      ).rejects.toThrow(NotFoundException);
      expect(redisService.connectToDatabaseInstance).not.toHaveBeenCalled();
    });

    it('should throw KeytarUnavailable error', async () => {
      databasesProvider.getOneById.mockRejectedValue(new KeytarUnavailableException());

      await expect(
        service.connectToInstance(mockStandaloneDatabaseEntity.id),
      ).rejects.toThrow(KeytarUnavailableException);
      expect(redisService.connectToDatabaseInstance).not.toHaveBeenCalled();
    });

    it('failed connection to the redis database', async () => {
      redisService.connectToDatabaseInstance = jest
        .fn()
        .mockRejectedValue(new Error(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB));

      await expect(
        service.connectToInstance(mockStandaloneDatabaseEntity.id, AppTool.Common),
      ).rejects.toThrow(BadRequestException);
    });

    it('connection error [username or password]', async () => {
      redisService.connectToDatabaseInstance = jest
        .fn()
        .mockRejectedValue(new Error('WRONGPASS incorrect credentials'));

      try {
        await service.connectToInstance(
          mockStandaloneDatabaseEntity.id,
          AppTool.Common,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toEqual(ERROR_MESSAGES.AUTHENTICATION_FAILED());
      }
    });

    it('connection error [incorrect tls cert]', async () => {
      redisService.connectToDatabaseInstance = jest
        .fn()
        .mockRejectedValue(new Error('ERR_OSSL incorrect certificate'));

      try {
        await service.connectToInstance(
          mockStandaloneDatabaseEntity.id,
          AppTool.Common,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(
            mockStandaloneDatabaseEntity.name,
          ),
        );
      }
    });
    it('connection error [Connection details are incorrect]', async () => {
      redisService.connectToDatabaseInstance = jest
        .fn()
        .mockRejectedValue(new Error('ENOTFOUND some message'));

      try {
        await service.connectToInstance(
          mockStandaloneDatabaseEntity.id,
          AppTool.Common,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(
            mockStandaloneDatabaseEntity.name,
          ),
        );
      }
    });
    it('connection error [Connection timeout]', async () => {
      redisService.connectToDatabaseInstance = jest
        .fn()
        .mockRejectedValue(new Error('ETIMEDOUT some message'));

      try {
        await service.connectToInstance(
          mockStandaloneDatabaseEntity.id,
          AppTool.Common,
        );
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(GatewayTimeoutException);
        expect(err.message).toEqual(ERROR_MESSAGES.CONNECTION_TIMEOUT);
      }
    });
  });

  describe('getOverview', () => {
    const mockClient = new Redis();
    beforeEach(() => {
      mockClient.disconnect = jest.fn();
      service.connectToInstance = jest.fn();
      redisService.getClientInstance = jest.fn()
        .mockReturnValue(undefined);
      redisService.isClientConnected = jest.fn();
      overviewService.getOverview.mockResolvedValue(mockDatabaseOverview);
    });
    it('successfully get overview by using exist client', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected = jest.fn().mockReturnValue(true);

      const result = await service.getOverview(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual(mockDatabaseOverview);
      expect(service.connectToInstance).not.toHaveBeenCalled();
      expect(overviewService.getOverview).toHaveBeenCalledWith(
        mockStandaloneDatabaseEntity.id,
        mockRedisClientInstance.client,
      );
    });
    it('successfully create new client if if the existing one has no connection', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected = jest.fn().mockReturnValue(false);
      service.connectToInstance = jest.fn().mockResolvedValue(mockClient);

      const result = await service.getOverview(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual(mockDatabaseOverview);
      expect(service.connectToInstance).toHaveBeenCalled();
      expect(overviewService.getOverview).toHaveBeenCalledWith(
        mockStandaloneDatabaseEntity.id,
        mockClient,
      );
    });
  });
  describe('getInfo', () => {
    const mockClient = new Redis();
    beforeEach(() => {
      mockClient.disconnect = jest.fn();
      service.connectToInstance = jest.fn();
      redisService.getClientInstance = jest.fn().mockReturnValue(undefined);
      redisService.isClientConnected = jest.fn();
    });
    it('successfully get redis info by using exist client', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected = jest.fn().mockReturnValue(true);
      redisConfBusinessService.getRedisGeneralInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);

      const result = await service.getInfo(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual(mockRedisGeneralInfo);
      expect(service.connectToInstance).not.toHaveBeenCalled();
      expect(redisConfBusinessService.getRedisGeneralInfo).toHaveBeenCalledWith(
        mockRedisClientInstance.client,
      );
    });
    it('successfully get redis info without storing client', async () => {
      service.connectToInstance = jest.fn().mockResolvedValue(mockClient);
      redisConfBusinessService.getRedisGeneralInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);

      const result = await service.getInfo(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual(mockRedisGeneralInfo);
      expect(service.connectToInstance).toHaveBeenCalledWith(
        mockStandaloneDatabaseEntity.id,
        AppTool.Common,
        false,
      );
      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(redisConfBusinessService.getRedisGeneralInfo).toHaveBeenCalledWith(
        mockClient,
      );
    });
    it('successfully create new client if if the existing one has no connection', async () => {
      redisService.getClientInstance.mockReturnValue(mockRedisClientInstance);
      redisService.isClientConnected = jest.fn().mockReturnValue(false);
      service.connectToInstance = jest.fn().mockResolvedValue(mockClient);
      redisConfBusinessService.getRedisGeneralInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);

      const result = await service.getInfo(mockStandaloneDatabaseEntity.id);

      expect(result).toEqual(mockRedisGeneralInfo);
      expect(service.connectToInstance).toHaveBeenCalled();
      expect(redisConfBusinessService.getRedisGeneralInfo).toHaveBeenCalledWith(mockClient);
    });
    it('successfully get redis info and store client', async () => {
      service.connectToInstance = jest.fn().mockResolvedValue(mockClient);
      redisConfBusinessService.getRedisGeneralInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);

      const result = await service.getInfo(mockStandaloneDatabaseEntity.id, AppTool.Common, true);

      expect(result).toEqual(mockRedisGeneralInfo);
      expect(service.connectToInstance).toHaveBeenCalledWith(
        mockStandaloneDatabaseEntity.id,
        AppTool.Common,
        true,
      );
      expect(mockClient.disconnect).not.toHaveBeenCalled();
      expect(redisConfBusinessService.getRedisGeneralInfo).toHaveBeenCalledWith(mockClient);
    });

    it('database instance not found', async () => {
      service.connectToInstance = jest.fn().mockRejectedValue(new NotFoundException());

      await expect(
        service.getInfo(mockStandaloneDatabaseEntity.id),
      ).rejects.toThrow(NotFoundException);
      expect(
        redisConfBusinessService.getRedisGeneralInfo,
      ).not.toHaveBeenCalled();
    });

    it('failed connection to the redis database', async () => {
      service.connectToInstance = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
        );

      try {
        await service.getInfo(mockStandaloneDatabaseEntity.id);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(
          redisConfBusinessService.getRedisGeneralInfo,
        ).not.toHaveBeenCalled();
      }
    });

    it('connection error [Connection timeout]', async () => {
      service.connectToInstance = jest.fn().mockRejectedValue(new GatewayTimeoutException());

      try {
        await service.getInfo(mockStandaloneDatabaseEntity.id);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(GatewayTimeoutException);
        expect(
          redisConfBusinessService.getRedisGeneralInfo,
        ).not.toHaveBeenCalled();
      }
    });
  });

  describe('rename', () => {
    const newName = 'newName';
    it('successfully rename the database instance', async () => {
      const mockResult: RenameDatabaseInstanceResponse = {
        oldName: mockStandaloneDatabaseEntity.name,
        newName,
      };
      databasesProvider.getOneById.mockResolvedValue({
        ...mockStandaloneDatabaseEntity,
      });

      const result = await service.rename(
        mockStandaloneDatabaseEntity.id,
        newName,
      );

      expect(result).toEqual(mockResult);
      expect(databasesProvider.getOneById).toHaveBeenCalledWith(mockStandaloneDatabaseEntity.id, true);
      expect(databasesProvider.patch).toHaveBeenCalledWith(mockStandaloneDatabaseEntity.id, {
        name: newName,
      });
    });
    it('database instance not found', async () => {
      databasesProvider.getOneById.mockRejectedValue(new NotFoundException());

      await expect(
        service.rename(mockStandaloneDatabaseEntity.id, 'newName'),
      ).rejects.toThrow(NotFoundException);
      expect(databasesProvider.patch).not.toHaveBeenCalled();
    });
  });

  describe('addSentinelMasters', () => {
    beforeEach(() => {
      service.getInfo = jest.fn().mockResolvedValue(mockRedisGeneralInfo);
      redisConfBusinessService.checkSentinelConnection.mockReturnValue(true);
    });

    it('successfully added master groups from sentinel', async () => {
      redisService.createStandaloneClient.mockResolvedValue(new Redis());
      service.createSentinelDatabaseEntity = jest
        .fn()
        .mockResolvedValue(mockSentinelDatabaseEntity);
      databasesProvider.save.mockResolvedValue(mockSentinelDatabaseEntity);

      const result = await service.addSentinelMasters(
        mockAddSentinelMastersDto,
      );

      expect(result).toEqual(mockAddSentinelMasterSuccessResponse);
      expect(service.createSentinelDatabaseEntity).toHaveBeenCalledTimes(
        result.length,
      );
      expect(databasesProvider.save).toHaveBeenCalledTimes(
        filter(result, { status: AddRedisDatabaseStatus.Success }).length,
      );
    });

    it('failed to add master groups from sentinel', async () => {
      redisService.createStandaloneClient.mockResolvedValue(new Redis());
      service.createSentinelDatabaseEntity = jest
        .fn()
        .mockRejectedValue(
          new NotFoundException(ERROR_MESSAGES.MASTER_GROUP_NOT_EXIST),
        );

      const result = await service.addSentinelMasters(
        mockAddSentinelMastersDto,
      );

      expect(result).toEqual(mockAddSentinelMasterFailResponse);
      expect(service.createSentinelDatabaseEntity).toHaveBeenCalledTimes(
        result.length,
      );
      expect(instanceRepository.save).toHaveBeenCalledTimes(
        filter(result, { status: AddRedisDatabaseStatus.Success }).length,
      );
    });

    it('wrong database type', async () => {
      redisService.createStandaloneClient.mockResolvedValue(new Redis());
      redisConfBusinessService.checkSentinelConnection.mockReturnValue(false);

      try {
        await service.addSentinelMasters(mockAddSentinelMastersDto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DATABASE_TYPE);
      }
    });

    it('connection error [Connection details are incorrect]', async () => {
      redisService.createStandaloneClient.mockRejectedValue(
        new Error('ENOTFOUND some message'),
      );

      try {
        await service.addSentinelMasters(mockAddSentinelMastersDto);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        expect(err.message).toEqual(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(
            `${mockAddSentinelMastersDto.host}:${mockAddSentinelMastersDto.port}`,
          ),
        );
      }
    });
  });
});
