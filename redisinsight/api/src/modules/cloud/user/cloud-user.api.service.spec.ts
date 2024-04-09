import { Test, TestingModule } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import {
  mockCloudAccountInfo, mockCloudApiAuthDto,
  mockCloudCapiAuthDto, mockCloudSessionService, mockCloudUserApiProvider,
  mockCloudUserCapiProvider, mockCloudUserRepository, mockSessionMetadata,
  mockCloudUser,
  MockType,
} from 'src/__mocks__';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudUserApiProvider } from 'src/modules/cloud/user/providers/cloud-user.api.provider';
import { CloudUserRepository } from 'src/modules/cloud/user/repositories/cloud-user.repository';
import { CloudSessionService } from 'src/modules/cloud/session/cloud-session.service';
import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { mockCloudAuthService } from 'src/__mocks__/cloud-auth';

describe('CloudUserApiService', () => {
  let service: CloudUserApiService;
  let apiProvider: MockType<CloudUserApiProvider>;
  let repository: MockType<CloudUserRepository>;
  let sessionService: MockType<CloudSessionService>;
  let authService: MockType<CloudAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudUserApiService,
        {
          provide: CloudUserApiProvider,
          useFactory: mockCloudUserApiProvider,
        },
        {
          provide: CloudUserRepository,
          useFactory: mockCloudUserRepository,
        },
        {
          provide: CloudSessionService,
          useFactory: mockCloudSessionService,
        },
        {
          provide: CloudAuthService,
          useFactory: mockCloudAuthService,
        },
      ],
    }).compile();

    service = module.get(CloudUserApiService);
    apiProvider = module.get(CloudUserApiProvider);
    repository = module.get(CloudUserRepository);
    sessionService = module.get(CloudSessionService);
    authService = module.get(CloudAuthService);
  });

  describe('ensureCsrf', () => {
    it('successfully get list of capi keys', async () => {
      // expect(await service['ensureCsrf'](mockSessionMetadata)).toEqual(mockCloudAccountInfo);
    });
    // it('throw CloudApiUnauthorizedException exception', async () => {
    //   apiProvider.getCurrentAccount.mockRejectedValueOnce(new CloudApiUnauthorizedException());
    //   await expect(service.getCurrentAccount(mockCloudCapiAuthDto)).rejects.toThrow(
    //     CloudApiUnauthorizedException,
    //   );
    // });
  });

  describe('ensureAccessToken', () => {
    it('Should not renew when access token is not expired', async () => {
      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) + 3600 }, 'test');
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
    it('Should not renew when access token is not expired and 3m until expiration time', async () => {
      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) + 180 }, 'test');
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
    it('Should renew tokens when access token is expired', async () => {
      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) - 3600 }, 'test');
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should renew tokens when access token is not expired but < 2m until exp time', async () => {
      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) + 100 }, 'test');
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });
      await service['ensureAccessToken'](mockSessionMetadata);

      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should throw CloudApiUnauthorizedException in case of any error', async () => {
      authService.renewTokens.mockRejectedValueOnce(new Error());

      const mockedAccessToken = sign({ exp: Math.trunc(Date.now() / 1000) }, 'test');
      sessionService.getSession.mockResolvedValueOnce({
        ...mockCloudApiAuthDto,
        accessToken: mockedAccessToken,
      });

      await expect(service['ensureAccessToken'](mockSessionMetadata)).rejects.toThrow(CloudApiUnauthorizedException);
      expect(authService.renewTokens).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCloudApiAuthDto.idpType,
        mockCloudApiAuthDto.refreshToken,
      );
    });
    it('Should throw CloudApiUnauthorizedException error if there is no session', async () => {
      sessionService.getSession.mockResolvedValueOnce(null);

      await expect(service['ensureAccessToken'](mockSessionMetadata)).rejects.toThrow(CloudApiUnauthorizedException);
      expect(authService.renewTokens).not.toHaveBeenCalled();
    });
  });
});
