import IORedis from 'ioredis';
import {
  mockSocket,
  mockBulActionsAnalyticsService,
} from 'src/__mocks__';
import {
  DeleteBulkActionSimpleRunner,
} from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { BulkActionType } from 'src/modules/bulk-actions/constants';
import { RedisDataType } from 'src/modules/browser/dto';

const nodeClient = Object.create(IORedis.prototype);

const mockBulkActionFilter = {
  count: 10_000,
  match: '*',
  type: RedisDataType.Set,
};

const mockCreateBulkActionDto = {
  id: 'bulk-action-id',
  databaseId: 'database-id',
  type: BulkActionType.Delete,
};

const bulkAction = new BulkAction(
  mockCreateBulkActionDto.id,
  mockCreateBulkActionDto.databaseId,
  mockCreateBulkActionDto.type,
  mockBulkActionFilter,
  mockSocket,
  mockBulActionsAnalyticsService,
);

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);

xdescribe('DeleteBulkActionSimpleRunner', () => {
  let deleteRunner: DeleteBulkActionSimpleRunner;

  beforeEach(() => {
    deleteRunner = new DeleteBulkActionSimpleRunner(bulkAction, nodeClient);
  });

  it('prepareCommands 3 commands', () => {
    const commands = deleteRunner.prepareCommands([mockKeyBuffer, mockKeyBuffer, mockKeyBuffer]);
    expect(commands).toEqual([
      ['del', [mockKeyBuffer]],
      ['del', [mockKeyBuffer]],
      ['del', [mockKeyBuffer]],
    ]);
  });

  it('prepareCommands 0 commands', () => {
    const commands = deleteRunner.prepareCommands([]);
    expect(commands).toEqual([]);
  });
});
