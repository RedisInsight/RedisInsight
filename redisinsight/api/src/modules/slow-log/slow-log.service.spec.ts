import { Test, TestingModule } from '@nestjs/testing';
import {
  mockRedisNoPermError,
  mockDatabase,
  MockType,
  mockDatabaseConnectionService,
  mockIORedisClient,
  mockIORedisCluster,
  mockIOClusterNode1,
  mockIOClusterNode2,
} from 'src/__mocks__';
import { IFindRedisClientInstanceByOptions } from 'src/modules/redis/redis.service';
import { SlowLogService } from 'src/modules/slow-log/slow-log.service';
import { AppTool } from 'src/models';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SlowLogArguments, SlowLogCommands } from 'src/modules/slow-log/constants/commands';
import { SlowLogAnalyticsService } from 'src/modules/slow-log/slow-log-analytics.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';

const mockClientOptions: IFindRedisClientInstanceByOptions = {
  instanceId: mockDatabase.id,
  tool: AppTool.Common,
};

const getSlowLogDto = { count: 100 };
const mockSlowLog = {
  id: 1,
  time: 165234561,
  durationUs: 100,
  args: 'get foo',
  source: '127.0.0.1:12399',
  client: 'client-name',
};

const mockLogReply = [
  mockSlowLog.id,
  mockSlowLog.time,
  mockSlowLog.durationUs,
  mockSlowLog.args.split(' '),
  mockSlowLog.source,
  mockSlowLog.client,
];
const mockSlowLogConfig = {
  slowlogMaxLen: 128,
  slowlogLogSlowerThan: 10000,
};

const mockSlowlogConfigReply = [
  'slowlog-max-len',
  mockSlowLogConfig.slowlogMaxLen,
  'slowlog-log-slower-than',
  mockSlowLogConfig.slowlogLogSlowerThan,
];

const mockSlowLogReply = [mockLogReply, mockLogReply];

describe('SlowLogService', () => {
  let service: SlowLogService;
  let analyticsService: SlowLogAnalyticsService;
  let databaseConnectionService: MockType<DatabaseConnectionService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlowLogService,
        EventEmitter2,
        SlowLogAnalyticsService,
        {
          provide: DatabaseConnectionService,
          useFactory: mockDatabaseConnectionService,
        },
      ],
    }).compile();

    service = await module.get(SlowLogService);
    databaseConnectionService = await module.get(DatabaseConnectionService);
    analyticsService = await module.get(SlowLogAnalyticsService);

    mockIORedisClient.call.mockResolvedValue(mockSlowLogReply);
    mockIOClusterNode1.call.mockResolvedValue(mockSlowLogReply);
    mockIOClusterNode2.call.mockResolvedValue(mockSlowLogReply);
  });

  describe('getSlowLogs', () => {
    it('should return slowlogs for standalone', async () => {
      const res = await service.getSlowLogs(mockClientOptions, getSlowLogDto);
      expect(res).toEqual([mockSlowLog, mockSlowLog]);
    });
    it('should return slowlogs for standalone without active connection', async () => {
      const res = await service.getSlowLogs(mockClientOptions, getSlowLogDto);
      expect(res).toEqual([mockSlowLog, mockSlowLog]);
    });
    it('should return slowlogs cluster', async () => {
      databaseConnectionService.getOrCreateClient.mockResolvedValueOnce(mockIORedisCluster);
      const res = await service.getSlowLogs(mockClientOptions, getSlowLogDto);
      expect(res).toEqual([mockSlowLog, mockSlowLog, mockSlowLog, mockSlowLog]);
    });
    it('should proxy HttpException', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw new BadRequestException('error');
      });
      try {
        await service.getSlowLogs(mockClientOptions, getSlowLogDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an Forbidden error when command execution failed', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw mockRedisNoPermError;
      });

      try {
        await service.getSlowLogs(mockClientOptions, getSlowLogDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('reset', () => {
    it('should reset slowlogs for standalone', async () => {
      await service.reset(mockClientOptions);
      expect(mockIORedisClient.call).toHaveBeenCalledWith(SlowLogCommands.SlowLog, SlowLogArguments.Reset);
    });
    it('should reset slowlogs cluster', async () => {
      databaseConnectionService.getOrCreateClient.mockResolvedValueOnce(mockIORedisCluster);
      await service.reset(mockClientOptions);
      expect(mockIOClusterNode1.call).toHaveBeenCalledWith(SlowLogCommands.SlowLog, SlowLogArguments.Reset);
    });
    it('should proxy HttpException', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw new BadRequestException('error');
      });

      try {
        await service.reset(mockClientOptions);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an Forbidden error when command execution failed', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw mockRedisNoPermError;
      });

      try {
        await service.reset(mockClientOptions);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('getConfig', () => {
    it('should get slowlogs config', async () => {
      mockIORedisClient.call.mockResolvedValueOnce(mockSlowlogConfigReply);

      const res = await service.getConfig(mockClientOptions);
      expect(res).toEqual(mockSlowLogConfig);
    });
    it('should get ONLY supported slowlogs config even if there some extra fields in resp', async () => {
      mockIORedisClient.call.mockResolvedValueOnce([
        ...mockSlowlogConfigReply,
        'slowlog-extra',
        12,
      ]);

      const res = await service.getConfig(mockClientOptions);
      expect(res).toEqual(mockSlowLogConfig);
    });
    it('should proxy HttpException', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw new BadRequestException('error');
      });

      try {
        await service.getConfig(mockClientOptions);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an Forbidden error when command execution failed', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw mockRedisNoPermError;
      });

      try {
        await service.getConfig(mockClientOptions);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('updateConfig', () => {
    it('should update slowlogs config (1 field)', async () => {
      mockIORedisClient.call.mockResolvedValueOnce(mockSlowlogConfigReply);
      mockIORedisClient.call.mockResolvedValueOnce('OK');

      const res = await service.updateConfig(mockClientOptions, { slowlogMaxLen: 128 });
      expect(res).toEqual(mockSlowLogConfig);
      expect(mockIORedisClient.call).toHaveBeenCalledTimes(2);
    });
    it('should update slowlogs config (2 fields)', async () => {
      mockIORedisClient.call
        .mockResolvedValueOnce(mockSlowlogConfigReply)
        .mockResolvedValueOnce('OK')
        .mockResolvedValueOnce('OK');

      const res = await service.updateConfig(mockClientOptions, { slowlogMaxLen: 128, slowlogLogSlowerThan: 1 });
      expect(res).toEqual({ slowlogMaxLen: 128, slowlogLogSlowerThan: 1 });
      expect(mockIORedisClient.call).toHaveBeenCalledTimes(3);
    });
    it('should throw an error for cluster', async () => {
      databaseConnectionService.getOrCreateClient.mockResolvedValueOnce(mockIORedisCluster);
      databaseConnectionService.getOrCreateClient.mockResolvedValueOnce(mockIORedisCluster);
      mockIORedisCluster.call.mockResolvedValueOnce(mockSlowlogConfigReply);

      try {
        await service.updateConfig(mockClientOptions, { slowlogMaxLen: 128, slowlogLogSlowerThan: 1 });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should proxy HttpException', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw new BadRequestException('error');
      });

      try {
        await service.updateConfig(mockClientOptions, { slowlogMaxLen: 1 });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an Forbidden error when command execution failed', async () => {
      databaseConnectionService.getOrCreateClient.mockImplementationOnce(() => {
        throw mockRedisNoPermError;
      });

      try {
        await service.updateConfig(mockClientOptions, { slowlogMaxLen: 1 });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
