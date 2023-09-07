import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { CloudCapiKeyAnalytics } from 'src/modules/cloud/capi-key/cloud-capi-key.analytics';

describe('CloudCapiKeyAnalytics', () => {
  let service: CloudCapiKeyAnalytics;
  let sendEventSpy;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudCapiKeyAnalytics,
      ],
    }).compile();

    service = await module.get(CloudCapiKeyAnalytics);
    sendEventSpy = jest.spyOn<CloudCapiKeyAnalytics, any>(service, 'sendEvent');
    sendFailedEventMethod = jest.spyOn<CloudCapiKeyAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCloudAccountKeyGenerated', () => {
    it('should emit succeed event with manifest "yes"', () => {
      service.sendCloudAccountKeyGenerated();

      expect(sendEventSpy).toHaveBeenNthCalledWith(
        1,
        TelemetryEvents.CloudAccountKeyGenerated,
      );
    });
  });

  describe('sendCloudAccountKeyGenerationFailed', () => {
    it('should emit 1 event with "Error" cause', () => {
      service.sendCloudAccountKeyGenerationFailed(httpException);

      expect(sendFailedEventMethod).toHaveBeenNthCalledWith(
        1,
        TelemetryEvents.CloudAccountKeyGenerationFailed,
        httpException,
      );
    });
  });
});
