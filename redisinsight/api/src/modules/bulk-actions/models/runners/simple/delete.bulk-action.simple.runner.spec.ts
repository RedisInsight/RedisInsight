/* eslint-disable import/first */
import IORedis from 'ioredis';
import {
  mockSocket,
  mockBulkActionsAnalytics,
  mockCreateBulkActionDto,
} from 'src/__mocks__';
import {
  DeleteBulkActionSimpleRunner,
} from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';

const nodeClient = Object.create(IORedis.prototype);

const mockBulkActionFilter = Object.assign(new BulkActionFilter(), {
  count: 10_000,
  match: '*',
  type: RedisDataType.Set,
});

const bulkAction = new BulkAction(
  mockCreateBulkActionDto.id,
  mockCreateBulkActionDto.databaseId,
  mockCreateBulkActionDto.type,
  mockBulkActionFilter,
  mockSocket,
  mockBulkActionsAnalytics as any,
);

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);

describe('DeleteBulkActionSimpleRunner', () => {
  let deleteRunner: DeleteBulkActionSimpleRunner;

  beforeEach(() => {
    deleteRunner = new DeleteBulkActionSimpleRunner(bulkAction, nodeClient);
  });

  it('prepareCommands 3 commands', () => {
    const commands = deleteRunner.prepareCommands([mockKeyBuffer, mockKeyBuffer, mockKeyBuffer]);
    expect(commands).toEqual([
      ['del', mockKeyBuffer],
      ['del', mockKeyBuffer],
      ['del', mockKeyBuffer],
    ]);
  });

  it('prepareCommands 0 commands', () => {
    const commands = deleteRunner.prepareCommands([]);
    expect(commands).toEqual([]);
  });
});
