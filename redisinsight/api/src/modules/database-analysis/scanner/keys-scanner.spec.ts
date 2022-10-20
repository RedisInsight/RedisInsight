import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
import IORedis from 'ioredis';
import { mockCreateDatabaseAnalysisDto } from 'src/modules/database-analysis/providers/database-analysis.provider.spec';

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

const mockRedisKeyspaceInfoResponse: string = '# Keyspace\r\ndb0:keys=1,expires=0,avg_ttl=0\r\n'
  + 'db3:keys=100,expires=0,avg_ttl=0\r\n';
const mockRedisKeyspaceInfoResponseNoKeyspaceData: string = '# Keyspace\r\n \r\n';
const mockRedisKeyspaceInfoResponseEmpty: string = '';

const mockKey = {
  name: Buffer.from('key'),
  type: 'string',
  ttl: -1,
  memory: 10,
  length: 2,
};

const mockScanResult = {
  keys: [mockKey],
  progress: {
    processed: 1,
    scanned: 15,
    total: 1,
  },
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
      .calledWith(jasmine.objectContaining({ name: 'info' }))
      .mockResolvedValue(mockRedisKeyspaceInfoResponse);
    when(clusterClient.sendCommand)
      .calledWith(jasmine.objectContaining({ name: 'info' }))
      .mockResolvedValue(mockRedisKeyspaceInfoResponse);
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
  });

  describe('scan', () => {
    it('should scan standalone database', async () => {
      expect(await service.scan(nodeClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual([mockScanResult]);
    });
    it('should scan cluster database', async () => {
      expect(await service.scan(clusterClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual([mockScanResult, mockScanResult, mockScanResult]);
    });
  });

  describe('nodeScan', () => {
    it('should scan node keys', async () => {
      expect(await service.nodeScan(nodeClient, {
        filter: mockCreateDatabaseAnalysisDto.filter,
      })).toEqual(mockScanResult);
    });
  });

  describe('getNodeTotal', () => {
    it('get total keys in db', async () => {
      expect(await service.getNodeTotal(nodeClient)).toEqual(1);
    });
    it('get total keys in db (db:3)', async () => {
      const client = Object.assign(nodeClient);
      client.options = { db: 3 };
      expect(await service.getNodeTotal(client)).toEqual(100);
    });
    it('get total keys in db (no keyspace data)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValueOnce(mockRedisKeyspaceInfoResponseNoKeyspaceData);

      expect(await service.getNodeTotal(nodeClient)).toEqual(0);
    });
    it('get total keys in db (no info data)', async () => {
      when(nodeClient.sendCommand)
        .calledWith(jasmine.objectContaining({ name: 'info' }))
        .mockResolvedValueOnce(mockRedisKeyspaceInfoResponseEmpty);

      expect(await service.getNodeTotal(nodeClient)).toEqual(0);
    });
  });
});
