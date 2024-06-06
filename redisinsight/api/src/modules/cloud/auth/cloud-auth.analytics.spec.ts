import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TelemetryEvents } from 'src/constants';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { CloudAuthAnalytics } from 'src/modules/cloud/auth/cloud-auth.analytics';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';

describe('CloudAuthAnalytics', () => {
  let service: CloudAuthAnalytics;
  let sendEventMethod;
  let sendFailedEventMethod;
  const httpException = new InternalServerErrorException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        CloudAuthAnalytics,
      ],
    }).compile();

    service = await module.get(CloudAuthAnalytics);
    sendEventMethod = jest.spyOn<CloudAuthAnalytics, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CloudAuthAnalytics, any>(
      service,
      'sendFailedEvent',
    );
  });

  describe('sendCloudSignInSucceeded', () => {
    it('should emit event with deep link flow', () => {
      service.sendCloudSignInSucceeded(CloudSsoFeatureStrategy.DeepLink, 'import-database');

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInSucceeded,
        {
          flow: CloudSsoFeatureStrategy.DeepLink,
          action: 'import-database',
        },
      );
    });
    it('should emit event with web flow', () => {
      service.sendCloudSignInSucceeded(CloudSsoFeatureStrategy.Web);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInSucceeded,
        {
          flow: CloudSsoFeatureStrategy.Web,
        },
      );
    });
    it('should emit event without flow and not fail', () => {
      service.sendCloudSignInSucceeded(undefined as CloudSsoFeatureStrategy);

      expect(sendEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInSucceeded,
        {
          flow: undefined,
        },
      );
    });
  });

  describe('sendGetRECloudSubsFailedEvent', () => {
    it('should emit error event with deep link flow', () => {
      service.sendCloudSignInFailed(httpException, CloudSsoFeatureStrategy.DeepLink, 'import');

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInFailed,
        httpException,
        { flow: CloudSsoFeatureStrategy.DeepLink, action: 'import' },
      );
    });
    it('should emit error event with web flow', () => {
      service.sendCloudSignInFailed(httpException, CloudSsoFeatureStrategy.Web);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInFailed,
        httpException,
        { flow: CloudSsoFeatureStrategy.Web },
      );
    });
    it('should not fail if no exception passed', () => {
      service.sendCloudSignInFailed(undefined, CloudSsoFeatureStrategy.Web);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInFailed,
        undefined,
        { flow: CloudSsoFeatureStrategy.Web },
      );
    });
    it('should emit error event without flow and not fail', () => {
      const exception = new InternalServerErrorException() as any;
      exception.options = undefined;

      service.sendCloudSignInFailed(exception as unknown as HttpException, undefined as CloudSsoFeatureStrategy);

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        TelemetryEvents.CloudSignInFailed,
        exception,
        { flow: undefined },
      );
    });
  });
});
