import { Test, TestingModule } from '@nestjs/testing';
import { Scanner } from 'src/modules/browser/keys/scanner/scanner';
import { IScannerStrategy } from 'src/modules/browser/keys/scanner/scanner.interface';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { ClusterStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.strategy';
import { BrowserToolService } from 'src/modules/browser/services/browser-tool/browser-tool.service';
import { mockRedisConsumer, mockSettingsService } from 'src/__mocks__';
import { StandaloneStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.strategy';
import { SettingsService } from 'src/modules/settings/settings.service';
import { ConnectionType } from 'src/modules/database/entities/database.entity';

let scanner;
let browserToolCluster;
let browserTool;
let settingsService;

class TestScanStrategy implements IScannerStrategy {
  public async getKeys() {
    return [];
  }

  public async getKeysInfo() {
    return [];
  }
}
const strategyName = 'testStrategy';
const testStrategy = new TestScanStrategy();

describe('Scanner Manager', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Scanner,
        {
          provide: BrowserToolClusterService,
          useFactory: () => ({
            execCommand: jest.fn(),
            execCommandFromNodes: jest.fn(),
            execCommandFromNode: jest.fn(),
            execPipeline: jest.fn(),
          }),
        },
        {
          provide: BrowserToolService,
          useFactory: mockRedisConsumer,
        },
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
      ],
    }).compile();

    scanner = module.get<Scanner>(Scanner);
    settingsService = module.get(SettingsService);
    browserToolCluster = module.get<BrowserToolClusterService>(
      BrowserToolClusterService,
    );
    browserTool = module.get<BrowserToolService>(BrowserToolService);
  });
  it('Should throw error if no strategy', () => {
    try {
      scanner.getStrategy(strategyName);
    } catch (e) {
      expect(e.message).toEqual(`Unsupported scan strategy: ${strategyName}`);
    }
  });
  it('Should add strategy to scanner and get it back', () => {
    scanner.addStrategy(strategyName, testStrategy);
    expect(scanner.getStrategy(strategyName)).toEqual(testStrategy);
  });
  it('Should support multiple strategies', () => {
    scanner.addStrategy('str1', testStrategy);
    scanner.addStrategy('str2', testStrategy);
    scanner.addStrategy('str3', testStrategy);
    expect(scanner.getStrategy('str1')).toEqual(testStrategy);
    expect(scanner.getStrategy('str2')).toEqual(testStrategy);
    expect(scanner.getStrategy('str3')).toEqual(testStrategy);
  });
  it('Should support Standalone and Cluster strategies', () => {
    scanner.addStrategy(
      ConnectionType.CLUSTER,
      new ClusterStrategy(browserToolCluster, settingsService),
    );
    scanner.addStrategy(
      ConnectionType.STANDALONE,
      new StandaloneStrategy(browserTool, settingsService),
    );
    scanner.addStrategy(
      ConnectionType.SENTINEL,
      new StandaloneStrategy(browserTool, settingsService),
    );
    expect(scanner.getStrategy(ConnectionType.CLUSTER)).toBeInstanceOf(
      ClusterStrategy,
    );
    expect(scanner.getStrategy(ConnectionType.STANDALONE)).toBeInstanceOf(
      StandaloneStrategy,
    );
    expect(scanner.getStrategy(ConnectionType.SENTINEL)).toBeInstanceOf(
      StandaloneStrategy,
    );
  });
});
