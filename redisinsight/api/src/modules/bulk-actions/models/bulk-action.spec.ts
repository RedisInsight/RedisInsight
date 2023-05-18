import IORedis from 'ioredis';
import { omit } from 'lodash';
import {
  mockSocket,
  mockBulActionsAnalyticsService,
} from 'src/__mocks__';
import {
  DeleteBulkActionSimpleRunner,
} from 'src/modules/bulk-actions/models/runners/simple/delete.bulk-action.simple.runner';
import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import * as Utils from 'src/modules/database/utils/database.total.util';

const mockExec = jest.fn();

const nodeClient = Object.create(IORedis.prototype);
nodeClient.sendCommand = jest.fn();
nodeClient.pipeline = jest.fn(() => ({
  exec: mockExec,
}));
nodeClient.options = { db: 0 };

const clusterClient = Object.create(IORedis.Cluster.prototype);
clusterClient.nodes = jest.fn();
clusterClient.sendCommand = jest.fn();

const mockBulkActionFilter = new BulkActionFilter();

const mockCreateBulkActionDto = {
  id: 'bulk-action-id',
  databaseId: 'database-id',
  type: BulkActionType.Delete,
};

const mockOverview = {
  ...mockCreateBulkActionDto,
  duration: 0,
  filter: { match: '*', type: null },
  progress: {
    scanned: 0,
    total: 0,
  },
  status: 'completed',
  summary: {
    failed: 0,
    processed: 0,
    succeed: 0,
    errors: [],
  },
};

let bulkAction;
let mockRunner;
let mockSummary;
let mockProgress;

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);
const mockRESPError = 'Reply Error: NOPERM for delete.';
const mockRESPErrorBuffer = Buffer.from(mockRESPError);

const mockGetTotalResponse_1: number = 10000;

const generateErrors = (amount: number, raw = true): any => (
  new Array(amount).fill(1)
).map(
  () => ({
    key: raw ? mockKeyBuffer : mockKey,
    error: raw ? mockRESPErrorBuffer : mockRESPError,
  }),
);

const generateProgress = () => {
  const progress = new BulkActionProgress();

  progress['total'] = 1_000_000;
  progress['scanned'] = 1_000_000;

  return progress;
};

const generateSummary = () => {
  const summary = new BulkActionSummary();

  summary['processed'] = 1_000_000;
  summary['succeed'] = 900_000;
  summary['failed'] = 100_000;
  summary['errors'] = generateErrors(500);

  return summary;
};

describe('AbstractBulkActionSimpleRunner', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    bulkAction = new BulkAction(
      mockCreateBulkActionDto.id,
      mockCreateBulkActionDto.databaseId,
      mockCreateBulkActionDto.type,
      mockBulkActionFilter,
      mockSocket,
      mockBulActionsAnalyticsService,
    );
  });

  describe('prepare', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'getTotal').mockResolvedValue(mockGetTotalResponse_1);
      clusterClient.nodes = jest.fn().mockReturnValue([nodeClient, nodeClient]);
    });

    it('should generate single runner for standalone', async () => {
      expect(bulkAction['runners']).toEqual([]);

      await bulkAction.prepare(nodeClient, DeleteBulkActionSimpleRunner);

      expect(bulkAction['status']).toEqual(BulkActionStatus.Ready);
      expect(bulkAction['runners'].length).toEqual(1);
      expect(bulkAction['runners'][0]).toBeInstanceOf(DeleteBulkActionSimpleRunner);
      expect(bulkAction['runners'][0]['progress']['total']).toEqual(10_000);
    });
    it('should generate 2 runners for cluster with 2 master nodes', async () => {
      expect(bulkAction['runners']).toEqual([]);

      await bulkAction.prepare(clusterClient, DeleteBulkActionSimpleRunner);

      expect(bulkAction['status']).toEqual(BulkActionStatus.Ready);
      expect(bulkAction['runners'].length).toEqual(2);
      expect(bulkAction['runners'][0]).toBeInstanceOf(DeleteBulkActionSimpleRunner);
      expect(bulkAction['runners'][0]['progress']['total']).toEqual(10_000);
      expect(bulkAction['runners'][1]).toBeInstanceOf(DeleteBulkActionSimpleRunner);
      expect(bulkAction['runners'][1]['progress']['total']).toEqual(10_000);
    });
    it('should fail when bulk action in inappropriate state', async () => {
      try {
        bulkAction['status'] = BulkActionStatus.Ready;
        await bulkAction.prepare(nodeClient, DeleteBulkActionSimpleRunner);
        fail();
      } catch (e) {
        expect(e.message).toEqual(`Unable to prepare bulk action with "${BulkActionStatus.Ready}" status`);
      }
    });
  });
  describe('start', () => {
    let runnerRunSpy;
    beforeEach(() => {
      mockRunner = new DeleteBulkActionSimpleRunner(bulkAction, nodeClient);
      runnerRunSpy = jest.spyOn(mockRunner, 'run');
      nodeClient.sendCommand.mockResolvedValue(10_000);
    });

    it('should throw an error when status is not READY', async () => {
      try {
        await bulkAction.start();
        fail();
      } catch (e) {
        expect(e.message).toEqual(`Unable to start bulk action with "${BulkActionStatus.Initialized}" status`);
      }
    });
    it('should start and run until the end', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner];
      runnerRunSpy.mockResolvedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(runnerRunSpy).toHaveBeenCalledTimes(1);
      expect(bulkAction['status']).toEqual(BulkActionStatus.Completed);
    });
    it('should start and run until the end for clusters', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner, mockRunner];
      runnerRunSpy.mockResolvedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(runnerRunSpy).toHaveBeenCalledTimes(2);
      expect(bulkAction['status']).toEqual(BulkActionStatus.Completed);
    });
    it('should start and run until the error occur', async () => {
      bulkAction['status'] = BulkActionStatus.Ready;
      bulkAction['runners'] = [mockRunner];
      runnerRunSpy.mockRejectedValue();

      const overview = await bulkAction.start();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 0,
        scanned: 0,
      });
      expect(overview.summary).toEqual({
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
      });

      await new Promise((res) => setTimeout(res, 100));

      expect(bulkAction.getStatus()).toEqual(BulkActionStatus.Failed);
    });
  });
  describe('getOverview', () => {
    beforeEach(() => {
      mockSummary = generateSummary();
      mockProgress = generateProgress();
      mockRunner = new DeleteBulkActionSimpleRunner(bulkAction, nodeClient);
      mockRunner['progress'] = mockProgress;
      mockRunner['summary'] = mockSummary;
      bulkAction['status'] = BulkActionStatus.Completed;
    });

    it('should return overview for standalone', async () => {
      bulkAction['runners'] = [mockRunner];

      const overview = await bulkAction.getOverview();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 1_000_000,
        scanned: 1_000_000,
      });
      expect(overview.summary).toEqual({
        processed: 1_000_000,
        succeed: 900_000,
        failed: 100_000,
        errors: generateErrors(500, false),
      });
    });
    it('should return overview for cluster', async () => {
      bulkAction['runners'] = [mockRunner, mockRunner, mockRunner];

      const overview = await bulkAction.getOverview();

      expect(overview.id).toEqual(mockCreateBulkActionDto.id);
      expect(overview.type).toEqual(mockCreateBulkActionDto.type);
      expect(overview.duration).toBeGreaterThanOrEqual(0);
      expect(overview.filter).toEqual(omit(mockBulkActionFilter, 'count'));
      expect(overview.progress).toEqual({
        total: 3_000_000,
        scanned: 3_000_000,
      });
      expect(overview.summary).toEqual({
        processed: 3_000_000,
        succeed: 2_700_000,
        failed: 300_000,
        errors: generateErrors(500, false),
      });
    });
  });
  describe('setStatus', () => {
    const testCases = [
      { input: BulkActionStatus.Completed, affect: true },
      { input: BulkActionStatus.Failed, affect: true },
      { input: BulkActionStatus.Aborted, affect: true },
      { input: BulkActionStatus.Initializing, affect: false },
      { input: BulkActionStatus.Initialized, affect: false },
      { input: BulkActionStatus.Preparing, affect: false },
      { input: BulkActionStatus.Ready, affect: false },
    ];

    testCases.forEach((testCase) => {
      it(`should change state to ${testCase.input} and ${testCase.affect ? '' : 'do not'} set a time`, () => {
        expect(bulkAction['status']).toEqual(BulkActionStatus.Initialized);
        expect(bulkAction['endTime']).toEqual(undefined);

        bulkAction.setStatus(testCase.input);

        expect(bulkAction['status']).toEqual(testCase.input);
        if (testCase.affect) {
          expect(bulkAction['endTime']).not.toEqual(undefined);
        } else {
          expect(bulkAction['endTime']).toEqual(undefined);
        }
      });
    });
  });
  describe('sendOverview', () => {
    let sendOverviewSpy;
    let sendActionSucceedSpy;
    let sendActionFailedSpy;
    let sendActionStoppedSpy;

    beforeEach(() => {
      sendActionSucceedSpy = jest.spyOn(bulkAction['analyticsService'], 'sendActionSucceed');
      sendActionFailedSpy = jest.spyOn(bulkAction['analyticsService'], 'sendActionFailed');
      sendActionStoppedSpy = jest.spyOn(bulkAction['analyticsService'], 'sendActionStopped');
      sendOverviewSpy = jest.spyOn(bulkAction, 'sendOverview');
    });

    it('Should not fail on emit error', () => {
      mockSocket.emit.mockImplementation(() => { throw new Error('some error'); });

      bulkAction.sendOverview();
    });
    it('Should send overview', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction.sendOverview();

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
    });

    it('Should call sendActionSucceed', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Completed;

      bulkAction.sendOverview();

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(sendActionFailedSpy).not.toHaveBeenCalled();
      expect(sendActionStoppedSpy).not.toHaveBeenCalled();
      expect(sendActionSucceedSpy).toHaveBeenCalledWith(mockOverview);
    });

    it('Should call sendActionFailed', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Failed;
      bulkAction['error'] = 'some error';

      bulkAction.sendOverview();

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(sendActionSucceedSpy).not.toHaveBeenCalled();
      expect(sendActionStoppedSpy).not.toHaveBeenCalled();
      expect(sendActionFailedSpy).toHaveBeenCalledWith(
        {
          ...mockOverview,
          status: 'failed',
        },
        'some error',
      );
    });

    it('Should call sendActionStopped', () => {
      mockSocket.emit.mockReturnValue();

      bulkAction['status'] = BulkActionStatus.Aborted;

      bulkAction.sendOverview();

      expect(sendOverviewSpy).toHaveBeenCalledTimes(1);
      expect(sendActionSucceedSpy).not.toHaveBeenCalled();
      expect(sendActionStoppedSpy).not.toHaveBeenCalled();
      expect(sendActionStoppedSpy).toHaveBeenCalledWith(
        {
          ...mockOverview,
          status: 'aborted',
        },
      );
    });
  });
  describe('Other', () => {
    it('getters', () => {
      expect(bulkAction.getSocket()).toEqual(bulkAction['socket']);
      expect(bulkAction.getFilter()).toEqual(bulkAction['filter']);
      expect(bulkAction.getId()).toEqual(bulkAction['id']);
    });
  });
});
