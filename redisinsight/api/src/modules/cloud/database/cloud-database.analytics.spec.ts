import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import {
  mockCloudCapiAuthDto,
  mockFreeCloudSubscriptionPlan1,
  mockCloudSubscriptionCapiService,
} from 'src/__mocks__';
import { InternalServerErrorException } from '@nestjs/common';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';

const mockData = {
  planId: mockFreeCloudSubscriptionPlan1.id,
  capiCredentials: mockCloudCapiAuthDto,
};

describe('CloudDatabaseAnalytics', () => {
  let service: CloudDatabaseAnalytics;
  let cloudSubscriptionCapiService: CloudSubscriptionCapiService;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudDatabaseAnalytics,
        CloudSubscriptionCapiService,
        {
          provide: CloudSubscriptionCapiService,
          useFactory: mockCloudSubscriptionCapiService,
        },
      ],
    }).compile();

    service = await module.get(CloudDatabaseAnalytics);
    cloudSubscriptionCapiService = await module.get(CloudSubscriptionCapiService);
    sendEventMethod = jest.spyOn<CloudDatabaseAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CloudDatabaseAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCloudSignInSucceeded', () => {
    it('should emit event with eventData', () => {
      service.sendCloudFreeDatabaseCreated({ data: 'custom' });

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudFreeDatabaseCreated,
        {
          data: 'custom',
        },
      );
    });

    it('should emit event with eventData = {}', () => {
      service.sendCloudFreeDatabaseCreated();

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudFreeDatabaseCreated,
        {},
      );
    });
  });

  describe('sendCloudFreeDatabaseFailed', () => {
    it('should emit error event with selected plan', async () => {
      await service.sendCloudFreeDatabaseFailed(
        httpException,
        {
          region: mockFreeCloudSubscriptionPlan1.region,
          provider: mockFreeCloudSubscriptionPlan1.provider,
        },
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudFreeDatabaseFailed,
        httpException,
        {
          region: mockFreeCloudSubscriptionPlan1.region,
          provider: mockFreeCloudSubscriptionPlan1.provider,
        },
      );
    });
  });

  it('should emit error event with selected plan', async () => {
    await service.sendCloudFreeDatabaseFailed(
      httpException,
      undefined,
    );

    expect(sendFailedEventMethod).toHaveBeenCalledWith(
      TelemetryEvents.CloudFreeDatabaseFailed,
      httpException,
      {},
    );
  });

  it('should emit error event when free subscription is not exist', async () => {
    await service.sendCloudFreeDatabaseFailed(
      httpException,
      undefined,
    );

    expect(sendFailedEventMethod).toHaveBeenCalledWith(
      TelemetryEvents.CloudFreeDatabaseFailed,
      httpException,
      {
        region: undefined,
        provider: undefined,
      },
    );
  });
});
