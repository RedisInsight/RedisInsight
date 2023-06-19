import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { InternalServerErrorException } from '@nestjs/common';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import {
  CloudDatabaseStatus,
  CloudSubscriptionStatus,
  CloudSubscriptionType
} from 'src/modules/cloud/autodiscovery/models';
import { mockCloudDatabase, mockCloudDatabaseFixed, mockCloudSubscription } from 'src/__mocks__';

describe('CloudAutodiscoveryAnalytics', () => {
  let service: CloudAutodiscoveryAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudAutodiscoveryAnalytics,
      ],
    }).compile();

    service = await module.get(CloudAutodiscoveryAnalytics);
    sendEventMethod = jest.spyOn<CloudAutodiscoveryAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CloudAutodiscoveryAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendGetRECloudSubsSucceedEvent', () => {
    it('should emit event with active subscriptions', () => {
      service.sendGetRECloudSubsSucceedEvent([
        mockCloudSubscription,
        mockCloudSubscription,
      ], CloudSubscriptionType.Flexible);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 2,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
        },
      );
    });
    it('should emit event with active and not active subscription', () => {
      service.sendGetRECloudSubsSucceedEvent([
        {
          ...mockCloudSubscription,
          status: CloudSubscriptionStatus.Error,
        },
        mockCloudSubscription,
      ], CloudSubscriptionType.Flexible);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 1,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
        },
      );
    });
    it('should emit event without active subscriptions', () => {
      service.sendGetRECloudSubsSucceedEvent([
        {
          ...mockCloudSubscription,
          status: CloudSubscriptionStatus.Error,
        },
        {
          ...mockCloudSubscription,
          status: CloudSubscriptionStatus.Error,
        },
      ], CloudSubscriptionType.Flexible);
      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 2,
          type: CloudSubscriptionType.Flexible,
        },
      );
    });
    it('should emit GetRECloudSubsSucceedEvent event for empty list', () => {
      service.sendGetRECloudSubsSucceedEvent([], CloudSubscriptionType.Flexible);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
          type: CloudSubscriptionType.Flexible,
        },
      );
    });
    it('should emit GetRECloudSubsSucceedEvent event for undefined input value', () => {
      service.sendGetRECloudSubsSucceedEvent(undefined, CloudSubscriptionType.Fixed);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoverySucceed,
        {
          numberOfActiveSubscriptions: 0,
          totalNumberOfSubscriptions: 0,
          type: CloudSubscriptionType.Fixed,
        },
      );
    });
    it('should not throw on error when sending GetRECloudSubsSucceedEvent event', () => {
      const input: any = {};

      expect(() => service.sendGetRECloudSubsSucceedEvent(input, CloudSubscriptionType.Flexible)).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendGetRECloudSubsFailedEvent', () => {
    it('should emit GetRECloudSubsFailedEvent event', () => {
      service.sendGetRECloudSubsFailedEvent(httpException, CloudSubscriptionType.Fixed);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudSubscriptionsDiscoveryFailed,
        httpException,
        { type: CloudSubscriptionType.Fixed },
      );
    });
  });

  describe('sendGetRECloudDbsSucceedEvent', () => {
    it('should emit event with active databases', () => {
      service.sendGetRECloudDbsSucceedEvent([
        mockCloudDatabase,
        mockCloudDatabaseFixed,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 2,
          totalNumberOfDatabases: 2,
          fixed: 1,
          flexible: 1,
        },
      );
    });
    it('should emit event with active and not active database', () => {
      service.sendGetRECloudDbsSucceedEvent([
        {
          ...mockCloudDatabase,
          status: CloudDatabaseStatus.Pending,
        },
        mockCloudDatabase,
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 1,
          totalNumberOfDatabases: 2,
          fixed: 0,
          flexible: 2,
        },
      );
    });
    it('should emit event without active databases', () => {
      service.sendGetRECloudDbsSucceedEvent([
        {
          ...mockCloudDatabase,
          status: CloudDatabaseStatus.Pending,
        },
      ]);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.RECloudDatabasesDiscoverySucceed,
        {
          numberOfActiveDatabases: 0,
          totalNumberOfDatabases: 1,
          fixed: 0,
          flexible: 1,
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
          fixed: 0,
          flexible: 0,
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
          fixed: 0,
          flexible: 0,
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
