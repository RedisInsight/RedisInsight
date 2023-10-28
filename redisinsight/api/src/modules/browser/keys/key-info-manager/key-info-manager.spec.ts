import { Test, TestingModule } from '@nestjs/testing';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { mockRedisConsumer } from 'src/__mocks__';
import { KeyInfoManager } from 'src/modules/browser/keys/key-info-manager/key-info-manager';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { UnsupportedTypeInfoStrategy } from 'src/modules/browser/keys/strategies';
import { IKeyInfoStrategy } from 'src/modules/browser/keys/key-info-manager/key-info-manager.interface';

class TestKeyInfoStrategy implements IKeyInfoStrategy {
  public async getInfo() {
    return null;
  }
}
const testStrategy = new TestKeyInfoStrategy();

describe(' KeyInfoManager', () => {
  let manager;
  let browserTool;
  let defaultStrategy;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
      ],
    }).compile();

    browserTool = module.get<BrowserToolService>(BrowserToolService);
    defaultStrategy = new UnsupportedTypeInfoStrategy(browserTool);
    manager = new KeyInfoManager(defaultStrategy);
  });
  it('Should return default strategy', () => {
    const strategy = manager.getStrategy('undefined');
    expect(strategy).toEqual(defaultStrategy);
  });
  it('Should add strategy to manager and get it back', () => {
    manager.addStrategy(RedisDataType.String, testStrategy);
    expect(manager.getStrategy(RedisDataType.String)).toEqual(testStrategy);
  });
  it('Should support multiple strategies', () => {
    manager.addStrategy('str1', testStrategy);
    manager.addStrategy('str2', testStrategy);
    manager.addStrategy('str3', testStrategy);
    expect(manager.getStrategy('str1')).toEqual(testStrategy);
    expect(manager.getStrategy('str2')).toEqual(testStrategy);
    expect(manager.getStrategy('str3')).toEqual(testStrategy);
  });
});
