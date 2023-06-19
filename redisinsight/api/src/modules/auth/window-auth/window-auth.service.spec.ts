import { Test, TestingModule } from '@nestjs/testing';
import { WindowAuthService } from './window-auth.service';
import { AbstractWindowAuthStrategy } from './strategies/abstract.window.auth.strategy';

export class TestAuthStrategy extends AbstractWindowAuthStrategy {
  async isAuthorized(): Promise<boolean> {
    return false;
  }
}

const testStrategy = new TestAuthStrategy();

describe('WindowAuthService', () => {
  let windowAuthService: WindowAuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WindowAuthService],
      exports: [WindowAuthService],
    }).compile();

    windowAuthService = module.get<WindowAuthService>(WindowAuthService);
  });
  it('Should set strategy to window auth manager and get it back', () => {
    windowAuthService.setStrategy(testStrategy);
    expect(windowAuthService.getStrategy()).toEqual(testStrategy);
  });
});
