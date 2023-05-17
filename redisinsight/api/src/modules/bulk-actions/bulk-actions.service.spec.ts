import IORedis from 'ioredis';
import * as MockedSocket from 'socket.io-mock';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MockType,
} from 'src/__mocks__';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { RedisDataType } from 'src/modules/browser/dto';
import { BulkActionType } from 'src/modules/bulk-actions/constants';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionsAnalyticsService } from 'src/modules/bulk-actions/bulk-actions-analytics.service';

export const mockSocket1 = new MockedSocket();
mockSocket1.id = '1';
mockSocket1['emit'] = jest.fn();

export const mockSocket2 = new MockedSocket();
mockSocket2.id = '2';
mockSocket2['emit'] = jest.fn();

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();

const mockBulkActionFilter = Object.assign(new BulkActionFilter(), {
  count: 10_000,
  match: '*',
  type: RedisDataType.Set,
});

const mockCreateBulkActionDto = Object.assign(new CreateBulkActionDto(), {
  id: 'bulk-action-id',
  databaseId: 'database-id',
  type: BulkActionType.Delete,
  filter: mockBulkActionFilter,
});

const mockEmitter = new EventEmitter2()

class AnalyticsService extends BulkActionsAnalyticsService {  
  constructor(protected eventEmitter: EventEmitter2) {
    super(eventEmitter);
  }
}

const mockBulkAction = new BulkAction(
  mockCreateBulkActionDto.id,
  mockCreateBulkActionDto.databaseId,
  mockCreateBulkActionDto.type,
  mockBulkActionFilter,
  mockSocket1,
  new AnalyticsService(mockEmitter),
);
const mockOverview = 'mocked overview...';

mockBulkAction['getOverview'] = jest.fn().mockReturnValue(mockOverview);

describe('BulkActionsService', () => {
  let service: BulkActionsService;
  let bulkActionProvider: MockType<BulkActionsProvider>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkActionsService,
        {
          provide: BulkActionsProvider,
          useFactory: () => ({
            create: jest.fn().mockResolvedValue(mockBulkAction),
            get: jest.fn().mockReturnValue(mockBulkAction),
            abort: jest.fn().mockReturnValue(mockBulkAction),
            abortUsersBulkActions: jest.fn().mockReturnValue(2),
          }),
        },
        {
          provide: BulkActionsAnalyticsService,
          useFactory: () => ({
            sendActionStarted: jest.fn(),
            sendActionStopped: jest.fn(),
            sendActionSucceed: jest.fn(),
            sendActionFailed: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get(BulkActionsService);
    bulkActionProvider = module.get(BulkActionsProvider);
  });

  describe('create', () => {
    it('should create and return overview', async () => {
      expect(await service.create(mockCreateBulkActionDto, mockSocket1)).toEqual(mockOverview);
      expect(bulkActionProvider.create).toHaveBeenCalledTimes(1);
    });
  });
  describe('get', () => {
    it('should get and return overview', async () => {
      expect(await service.get({ id: mockCreateBulkActionDto.id })).toEqual(mockOverview);
      expect(bulkActionProvider.get).toHaveBeenCalledTimes(1);
    });
  });
  describe('abort', () => {
    it('should abort and return overview', async () => {
      expect(await service.abort({ id: mockCreateBulkActionDto.id })).toEqual(mockOverview);
      expect(bulkActionProvider.abort).toHaveBeenCalledTimes(1);
    });
  });
  describe('disconnect', () => {
    it('should call abortUsersBulkActions on disconnect', async () => {
      expect(service.disconnect(mockSocket1.id)).toEqual(undefined);
      expect(bulkActionProvider.abortUsersBulkActions).toHaveBeenCalledTimes(1);
    });
  });
});
