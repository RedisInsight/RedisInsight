import { Test, TestingModule } from '@nestjs/testing';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { mockSettingsProvider } from 'src/__mocks__';
import { TelemetryEvents } from 'src/constants';
import {
  AnalyticsService,
  NON_TRACKING_ANONYMOUS_ID,
} from './analytics.service';

let mockAnalyticsTrack;
jest.mock(
  'analytics-node',
  () => jest.fn()
    .mockImplementation(() => ({
      track: mockAnalyticsTrack,
    })),
);

const mockAnonymousId = 'a77b23c1-7816-4ea4-b61f-d37795a0f805';
const mockSettingsWithPermission = {
  agreements: {
    version: '1.0.1',
    analytics: true,
  },
};
const mockSettingsWithoutPermission = {
  agreements: {
    version: '1.0.1',
    analytics: false,
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let settingsService: ISettingsProvider;
  const sessionId = new Date().getTime();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: 'SETTINGS_PROVIDER',
          useFactory: mockSettingsProvider,
        },
      ],
    }).compile();

    settingsService = module.get<ISettingsProvider>('SETTINGS_PROVIDER');
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    const anonymousId = service.getAnonymousId();

    expect(service).toBeDefined();
    expect(anonymousId).toEqual(NON_TRACKING_ANONYMOUS_ID);
  });

  describe('initialize', () => {
    it('should set anonymousId', () => {
      service.initialize({ anonymousId: mockAnonymousId, sessionId });

      const anonymousId = service.getAnonymousId();

      expect(anonymousId).toEqual(mockAnonymousId);
    });
  });

  describe('sendEvent', () => {
    beforeEach(() => {
      mockAnalyticsTrack = jest.fn();
      service.initialize({ anonymousId: mockAnonymousId, sessionId });
    });
    it('should send event with anonymousId if permission are granted', async () => {
      settingsService.getSettings = jest
        .fn()
        .mockResolvedValue(mockSettingsWithPermission);

      await service.sendEvent({
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: false,
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        anonymousId: mockAnonymousId,
        integrations: { Amplitude: { session_id: sessionId } },
        event: TelemetryEvents.ApplicationStarted,
        properties: {},
      });
    });
    it('should not send event if permission are not granted', async () => {
      settingsService.getSettings = jest
        .fn()
        .mockResolvedValue(mockSettingsWithoutPermission);

      await service.sendEvent({
        event: 'SOME_EVENT',
        eventData: {},
        nonTracking: false,
      });

      expect(mockAnalyticsTrack).not.toHaveBeenCalled();
    });
    it('should send event for non tracking events event if permission are not granted', async () => {
      settingsService.getSettings = jest
        .fn()
        .mockResolvedValue(mockSettingsWithoutPermission);

      await service.sendEvent({
        event: TelemetryEvents.ApplicationStarted,
        eventData: {},
        nonTracking: true,
      });

      expect(mockAnalyticsTrack).toHaveBeenCalledWith({
        anonymousId: NON_TRACKING_ANONYMOUS_ID,
        integrations: { Amplitude: { session_id: sessionId } },
        event: TelemetryEvents.ApplicationStarted,
        properties: {},
      });
    });
  });
});
