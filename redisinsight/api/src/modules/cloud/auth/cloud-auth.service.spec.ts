import { CloudAuthService } from 'src/modules/cloud/auth/cloud-auth.service';
import { OktaAuth } from '@okta/okta-auth-js';
import { mockOktaAuthClient } from 'src/__mocks__/cloud-auth';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CloudAuthService', () => {
  let service: CloudAuthService;

  beforeEach(async () => {
    // (OktaAuth as any).mockReturnValueOnce(mockOktaAuthClient);
    //
    // const module: TestingModule = await Test.createTestingModule({
    //   providers: [
    //     EventEmitter2,
    //     CloudAuthService,
    //   ],
    // }).compile();
  });

  it('test', async () => {
    expect(true);
  });
});
