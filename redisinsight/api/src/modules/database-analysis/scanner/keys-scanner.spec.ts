import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
import IORedis from 'ioredis';
import { mockCreateDatabaseAnalysisDto } from 'src/modules/database-analysis/providers/database-analysis.provider.spec';
import * as Utils from 'src/modules/database/utils/database.total.util';

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();
const mockExec = jest.fn();
nodeClient.pipeline = jest.fn(() => ({
  exec: mockExec,
}));

const clusterClient = Object.create(IORedis.Cluster.prototype);
clusterClient.sendCommand = jest.fn();
clusterClient.nodes = jest.fn();

const mockInfoStrategy = () => ({
  getLength: jest.fn(),
  getLengthSafe: jest.fn(),
});

const mockKeyInfoProvider = () => ({
  getStrategy: jest.fn(),
});

const mockGetTotalResponse = 1;

const mockKey = {
  name: Buffer.from('key'),
  type: 'string',
  ttl: -1,
  memory: 10,
  length: 2,
};

const mockIndex = 'idx';

const mockScanResult = {
  keys: [mockKey],
  indexes: [mockIndex],
  progress: {
    processed: 1,
    scanned: 15,
    total: 1,
  },
  client: Object.assign(nodeClient),
};

describe('KeysScanner', () => {
  let service: KeysScanner;
  let infoProvider;
  let infoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeysScanner,
        {
          provide: KeyInfoProvider,
          useFactory: mockKeyInfoProvider,
        },
      ],
    }).compile();

    service = module.get<KeysScanner>(KeysScanner);
    infoProvider = module.get<KeyInfoProvider>(KeyInfoProvider);
    infoStrategy = mockInfoStrategy();
    infoProvider.getStrategy.mockReturnValue(infoStrategy);
    infoStrategy.getLengthSafe.mockResolvedValue(2);
    clusterClient.nodes.mockReturnValue([nodeClient, nodeClient, nodeClient]);
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'scan' }))
      .mockResolvedValue(['0', [mockKey.name]]);
    when(nodeClient.pipeline)
      .calledWith(jasmine.arrayContaining([
        jasmine.arrayContaining(['memory']),
      ])).mockReturnValue({ exec: jest.fn().mockResolvedValue([[null, 10]]) });
    when(nodeClient.pipeline)
      .calledWith(jasmine.arrayContaining([
        jasmine.arrayContaining(['ttl']),
      ])).mockReturnValue({ exec: jest.fn().mockResolvedValue([[null, -1]]) });
    when(nodeClient.pipeline)
      .calledWith(jasmine.arrayContaining([
        jasmine.arrayContaining(['type']),
      ])).mockReturnValue({ exec: jest.fn().mockResolvedValue([[null, 'string']]) });
    when(nodeClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'FT._LIST' }))
      .mockResolvedValue([mockIndex]);
  });

  describe('scan', () => {
    it('should scan standalone database', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse);
      expect(await service.scan(nodeClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual([mockScanResult]);
    });
    it('should scan cluster database', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse);
      expect(await service.scan(clusterClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual([mockScanResult, mockScanResult, mockScanResult]);
    });
  });

  describe('nodeScan', () => {
    it('should scan node keys', async () => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse);
      expect(await service.nodeScan(nodeClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual(mockScanResult);
    });
  });
});
