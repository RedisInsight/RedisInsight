import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCloudApiAuthDto, mockCloudCapiKeyService,
  mockCloudSessionService,
  mockCloudSubscriptionApiProvider,
  mockCloudSubscriptionCapiService,
  mockCloudSubscriptionRegions,
  mockSessionMetadata,
  mockSubscriptionPlanResponse,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudCapiKeyService } from 'src/modules/cloud/capi-key/cloud-capi-key.service';
import { CloudSubscriptionApiService } from './cloud-subscription.api.service';
import { CloudUserApiService } from '../user/cloud-user.api.service';
import { CloudSessionService } from '../session/cloud-session.service';
import { CloudSubscriptionCapiService } from './cloud-subscription.capi.service';
import { CloudSubscriptionApiProvider } from './providers/cloud-subscription.api.provider';

describe('CloudSubscriptionApiService', () => {
  let service: CloudSubscriptionApiService;
  let api: MockType<CloudSubscriptionApiProvider>;
  let sessionService: MockType<CloudSessionService>;
  let cloudUserApiService: MockType<CloudUserApiService>;
  let cloudSubscriptionCapiService: MockType<CloudSubscriptionCapiService>;

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
      ],
    }).compile();

    service = module.get(CloudSubscriptionApiService);
    api = module.get(CloudSubscriptionApiProvider);
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
