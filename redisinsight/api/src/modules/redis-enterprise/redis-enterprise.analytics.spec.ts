import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import {
  mockRedisCloudDatabaseDto,
  mockRedisCloudSubscriptionDto,
  mockRedisEnterpriseDatabaseDto,
} from 'src/__mocks__';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { RedisCloudSubscriptionStatus } from 'src/modules/redis-enterprise/models/redis-cloud-subscriptions';
import { InternalServerErrorException } from '@nestjs/common';
import { RedisEnterpriseAnalytics } from 'src/modules/redis-enterprise/redis-enterprise.analytics';

describe('RedisEnterpriseAnalytics', () => {
  let service: RedisEnterpriseAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        RedisEnterpriseAnalytics,
      ],
    }).compile();

    service = await module.get<RedisEnterpriseAnalytics>(RedisEnterpriseAnalytics);
    sendEventMethod = jest.spyOn<RedisEnterpriseAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<RedisEnterpriseAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendGetREClusterDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetREClusterDbsSucceedEvent([
        mockRedisEnterpriseDatabaseDto,
        mockRedisEnterpriseDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: 2,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event with active and not active database', () => {
      service.sendGetREClusterDbsSucceedEvent([
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
        mockRedisEnterpriseDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: 1,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event without active databases', () => {
      service.sendGetREClusterDbsSucceedEvent([
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
        {
          ...mockRedisEnterpriseDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit GetREClusterDbsSucceed event for empty list', () => {
      service.sendGetREClusterDbsSucceedEvent([]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should emit GetREClusterDbsSucceed event for undefined input value', () => {
      service.sendGetREClusterDbsSucceedEvent(undefined);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should not throw on error when sending GetREClusterDbsSucceed event', () => {
      const input: any = {};

      expect(() => service.sendGetREClusterDbsSucceedEvent(input)).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetREClusterDbsFailedEvent', () => {
    it('should emit GetREClusterDbsFailed event', () => {
      service.sendGetREClusterDbsFailedEvent(httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.REClusterDiscoveryFailed,
        httpException,
      );
    });
  });

  describe('sendGetRECloudSubsSucceedEvent', () => {
    it('should emit event with active subscriptions', () => {
      service.sendGetRECloudSubsSucceedEvent([
        mockRedisCloudSubscriptionDto,
        mockRedisCloudSubscriptionDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 2,
          totalNumberOfSubscriptions: 2,
        },
      );
    });
    it('should emit event with active and not active subscription', () => {
      service.sendGetRECloudSubsSucceedEvent([
        {
          ...mockRedisCloudSubscriptionDto,
          status: RedisCloudSubscriptionStatus.Error,
        },
        mockRedisCloudSubscriptionDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 1,
          totalNumberOfSubscriptions: 2,
        },
      );
    });
    it('should emit event without active subscriptions', () => {
      service.sendGetRECloudSubsSucceedEvent([
        {
          ...mockRedisCloudSubscriptionDto,
          status: RedisCloudSubscriptionStatus.Error,
        },
        {
          ...mockRedisCloudSubscriptionDto,
          status: RedisCloudSubscriptionStatus.Error,
        },
      ]);
      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 2,
        },
      );
    });
    it('should emit GetRECloudSubsSucceedEvent event for empty list', () => {
      service.sendGetRECloudSubsSucceedEvent([]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
        },
      );
    });
    it('should emit GetRECloudSubsSucceedEvent event for undefined input value', () => {
      service.sendGetRECloudSubsSucceedEvent(undefined);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
        },
      );
    });
    it('should not throw on error when sending GetRECloudSubsSucceedEvent event', () => {
      const input: any = {};

      expect(() => service.sendGetRECloudSubsSucceedEvent(input)).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRECloudSubsFailedEvent', () => {
    it('should emit GetRECloudSubsFailedEvent event', () => {
      service.sendGetRECloudSubsFailedEvent(httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoveryFailed,
        httpException,
      );
    });
  });

  describe('sendGetRECloudDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetRECloudDbsSucceedEvent([
        mockRedisCloudDatabaseDto,
        mockRedisCloudDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 2,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event with active and not active database', () => {
      service.sendGetRECloudDbsSucceedEvent([
        {
          ...mockRedisCloudDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
        mockRedisCloudDatabaseDto,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 1,
          totalNumberOfDatabases: 2,
        },
      );
    });
    it('should emit event without active databases', () => {
      service.sendGetRECloudDbsSucceedEvent([
        {
          ...mockRedisCloudDatabaseDto,
          status: RedisEnterpriseDatabaseStatus.Pending,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 1,
        },
      );
    });
    it('should emit event for empty list', () => {
      service.sendGetRECloudDbsSucceedEvent([]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should emit event for undefined input value', () => {
      service.sendGetRECloudDbsSucceedEvent(undefined);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 0,
        },
      );
    });
    it('should not throw on error', () => {
      const input: any = {};

      expect(() => service.sendGetRECloudDbsSucceedEvent(input)).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRECloudDbsFailedEvent', () => {
    it('should emit event', () => {
      service.sendGetRECloudDbsFailedEvent(httpException);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoveryFailed,
        httpException,
      );
    });
  });
});
