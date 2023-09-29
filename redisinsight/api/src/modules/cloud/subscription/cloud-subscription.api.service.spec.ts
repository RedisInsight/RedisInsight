import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudApiAuthDto, mockCloudCapiKeyService,
  mockCloudSessionService,
  mockCloudSubscriptionApiProvider,
  mockCloudSubscriptionCapiService,
  mockCloudSubscriptionRegions,
  mockFeatureService,
  mockSessionMetadata,
  mockSubscriptionPlanResponse,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { FeatureService } from 'src/modules/feature/feature.service';
import { CloudSubscriptionApiService } from './cloud-subscription.api.service';
import { CloudSessionService } from '../session/cloud-session.service';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';

describe('CloudSubscriptionApiService', () => {
  let service: CloudSubscriptionApiService;
  let api: MockType<CloudSubscriptionApiProvider>;
  let capi: MockType<CloudSubscriptionCapiService>;
  let featureService: MockType<FeatureService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudSubscriptionApiService,
        {
          provide: CloudSubscriptionApiProvider,
          useFactory: mockCloudSubscriptionApiProvider,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: CloudSubscriptionCapiService,
          useFactory: mockCloudSubscriptionCapiService,
        },
        {
          provide: CloudCapiKeyService,
          useFactory: mockCloudCapiKeyService,
        },
        {
          provide: FeatureService,
          useFactory: mockFeatureService,
        },
      ],
    }).compile();

    service = module.get(CloudSubscriptionApiService);
    api = module.get(CloudSubscriptionApiProvider);
    capi = module.get(CloudSubscriptionCapiService);
    featureService = module.get(FeatureService);
  });

  describe('getSubscriptionPlans', () => {
    it('successfully get plans and cloud regions', async () => {
      expect(await service.getSubscriptionPlans(mockSessionMetadata)).toEqual(mockSubscriptionPlanResponse);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      api.getCloudRegions.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getSubscriptionPlans(mockSessionMetadata)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });

    describe('filter', () => {
      beforeEach(() => {
        featureService.getByName.mockResolvedValueOnce({
          flag: true,
          data: {
            filterFreePlan: [{
              field: 'name',
              expression: '^(No HA?.)|(Cache?.)',
              options: 'i',
            }],
          },
        });
      });

      it('get empty list due to filter', async () => {
        capi.getSubscriptionsPlans.mockResolvedValueOnce([
          { name: 'some name', price: 0 },
        ]);
        expect(await service.getSubscriptionPlans(mockSessionMetadata)).toEqual([]);
      });

      it('filter only "no ha" and "cache" plans', async () => {
        capi.getSubscriptionsPlans.mockResolvedValueOnce([
          { name: 'some name', price: 0 },
          { name: 'no thing', price: 0 },
          { name: 'No HA', price: 0 },
          { name: 'No HA 30MB price:0', price: 0 },
          { name: 'No HA 30MB price:1', price: 1 },
          { name: 'no ha 30MB', price: 0 },
          { name: 'no ha', price: 0 },
          { name: 'Cache', price: 0 },
          { name: 'Cache 30MB', price: 0 },
          { name: 'cache', price: 0 },
          { name: 'cache 30MB', price: 0 },
          { name: '', price: 0 },
        ]);
        expect(await service.getSubscriptionPlans(mockSessionMetadata)).toEqual([
          { name: 'No HA', price: 0 },
          { name: 'No HA 30MB price:0', price: 0 },
          { name: 'no ha 30MB', price: 0 },
          { name: 'no ha', price: 0 },
          { name: 'Cache', price: 0 },
          { name: 'Cache 30MB', price: 0 },
          { name: 'cache', price: 0 },
          { name: 'cache 30MB', price: 0 },
        ]);
      });
    });
  });

  describe('getCloudRegions', () => {
    it('successfully get cloud regions', async () => {
      expect(await service.getCloudRegions(mockCloudApiAuthDto)).toEqual(mockCloudSubscriptionRegions);
    });
    it('throw CloudApiUnauthorizedException exception', async () => {
      api.getCloudRegions.mockRejectedValueOnce(new CloudApiUnauthorizedException());
      await expect(service.getCloudRegions(mockCloudApiAuthDto)).rejects.toThrow(
        CloudApiUnauthorizedException,
      );
    });
  });
});
