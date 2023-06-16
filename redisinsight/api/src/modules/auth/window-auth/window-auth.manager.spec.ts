import { Test, TestingModule } from '@nestjs/testing';
import { WindowAuthManager } from './window-auth.manager';
import { AbstractWindowAuthStrategy } from './strategies/abstract.window.auth.strategy';
import { IWindowAuthStrategyData } from './window.auth.strategy.interface';

export class TestAuthStrategy extends AbstractWindowAuthStrategy {
  async isWindowExists(): Promise<IWindowAuthStrategyData> {
    return { isExists: false };
  }
}

const testStrategy = new TestAuthStrategy();

describe('WindowAuthManager', () => {
  let windowAuthManager: WindowAuthManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WindowAuthManager],
      exports: [WindowAuthManager],
    }).compile();

    windowAuthManager = module.get<WindowAuthManager>(
      WindowAuthManager,
    );
  });
  it('Should set strategy to window auth manager and get it back', () => {
    windowAuthManager.setStrategy(testStrategy);
    expect(windowAuthManager.getStrategy()).toEqual(testStrategy);
  });
});
