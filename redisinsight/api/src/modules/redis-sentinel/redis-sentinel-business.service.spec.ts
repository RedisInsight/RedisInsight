import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as Redis from 'ioredis-mock';
import { ReplyError } from 'src/models';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { RedisService } from 'src/modules/core/services/redis/redis.service';
import { ConnectionOptionsDto } from 'src/modules/instances/dto/database-instance.dto';
import {
  mockAutodiscoveryAnalyticsService,
  mockRedisNoPermError,
  mockRedisSentinelMasterResponse,
  mockSentinelMasterDto,
  mockSentinelMasterInDownState,
  mockSentinelMasterInOkState,
} from 'src/__mocks__';
import { SentinelMasterStatus } from 'src/modules/redis-sentinel/models/sentinel';
import { RedisSentinelBusinessService } from './redis-sentinel-business.service';
import { AutodiscoveryAnalyticsService } from '../autodiscovery-analytics.service/autodiscovery-analytics.service';

const mockConnectionOptions: ConnectionOptionsDto = {
  host: '127.0.0.1',
  port: 26379,
};

const mockClient = new Redis();
mockClient.options = {
  ...mockConnectionOptions,
};

describe('RedisSentinelBusinessService', () => {
  let service: RedisSentinelBusinessService;
  let redisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisSentinelBusinessService,
        {
          provide: AutodiscoveryAnalyticsService,
          useFactory: mockAutodiscoveryAnalyticsService,
        },
        {
          provide: RedisService,
          useFactory: () => ({
            createStandaloneClient: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<RedisSentinelBusinessService>(
      RedisSentinelBusinessService,
    );
    redisService = await module.get<RedisService>(RedisService);
    mockClient.call = jest.fn();
    mockClient.quit = jest.fn();
  });

  describe('connectAndGetMasters', () => {
    it('connect and get sentinel masters', async () => {
      mockClient.call.mockResolvedValue(
        mockRedisSentinelMasterResponse,
      );
      service.getMasterEndpoints = jest
        .fn()
        .mockResolvedValue([mockConnectionOptions]);
      redisService.createStandaloneClient.mockResolvedValue(mockClient);

      const result = await service.connectAndGetMasters(mockConnectionOptions);

      expect(result).toEqual([mockSentinelMasterDto]);
      expect(mockClient.quit).toHaveBeenCalled();
    });
    it('failed connection to the redis database', async () => {
      redisService.createStandaloneClient.mockRejectedValue(
        new Error(ERROR_MESSAGES.NO_CONNECTION_TO_REDIS_DB),
      );

      await expect(
        service.connectAndGetMasters(mockConnectionOptions),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMasters', () => {
    it('succeed to get sentinel masters', async () => {
      service.getMasterEndpoints = jest
        .fn()
        .mockResolvedValue([mockConnectionOptions]);
      mockClient.call.mockResolvedValue(
        [mockSentinelMasterInOkState, mockSentinelMasterInDownState],
      );

      const result = await service.getMasters(mockClient);

      expect(mockClient.call).toHaveBeenCalledWith('sentinel', [
        'masters',
      ]);
      expect(result).toEqual([
        mockSentinelMasterDto,
        {
          ...mockSentinelMasterDto,
          status: SentinelMasterStatus.Down,
        },
      ]);
    });
    it('wrong database type', async () => {
      mockClient.call.mockRejectedValue({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      try {
        await service.getMasters(mockClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_DISCOVERY_TOOL());
      }
    });
    it("user don't have required permissions", async () => {
      const error: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      };
      mockClient.call.mockRejectedValue(error);

      await expect(service.getMasters(mockClient)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('getMasterEndpoints', () => {
    it('succeed to get sentinel master endpoints', async () => {
      const masterName = mockSentinelMasterDto.name;
      mockClient.call.mockResolvedValue([]);

      const result = await service.getMasterEndpoints(mockClient, masterName);

      expect(mockClient.call).toHaveBeenCalledWith('sentinel', [
        'sentinels',
        masterName,
      ]);
      expect(result).toEqual([mockConnectionOptions]);
    });
    it('wrong database type', async () => {
      mockClient.call.mockRejectedValue({
        message:
          'ERR unknown command `sentinel`, with args beginning with: `masters`',
      });

      await expect(
        service.getMasterEndpoints(mockClient, mockSentinelMasterDto.name),
      ).rejects.toThrow(BadRequestException);
    });
    it("user don't have required permissions", async () => {
      const error: ReplyError = {
        ...mockRedisNoPermError,
        command: 'SENTINEL',
      };
      mockClient.call.mockRejectedValue(error);

      await expect(
        service.getMasterEndpoints(mockClient, mockSentinelMasterDto.name),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
