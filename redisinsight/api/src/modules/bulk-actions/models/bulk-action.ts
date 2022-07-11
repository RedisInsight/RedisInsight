import IORedis from 'ioredis';
import { debounce } from 'lodash';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/contants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { IBulkAction } from 'src/modules/bulk-actions/models/bulk-action.interface';
import { BulkActionRunner } from 'src/modules/bulk-actions/models/bulk-action.runner';
import { Socket } from 'socket.io';

export class BulkAction implements IBulkAction {
  private readonly id: string;

  private readonly socket: Socket;

  private readonly type: BulkActionType;

  private status: BulkActionStatus;

  private readonly filter: BulkActionFilter;

  private runners: BulkActionRunner[];

  private readonly debounce: Function;

  constructor(id, type, filter, socket) {
    this.id = id;
    this.type = type;
    this.filter = filter;
    this.socket = socket;
    this.debounce = debounce(this.sendOverview.bind(this), 1000, { maxWait: 2000 });
    this.status = BulkActionStatus.Initialized;
  }

  /**
   * Setup runners and fetch total keys once before run
   * @param redisClient
   */
  async prepare(redisClient: IORedis.Redis | IORedis.Cluster) {
    if (this.status !== BulkActionStatus.Initialized) {
      throw new Error(`Unable to prepare bulk action with "${this.status}" status`);
    }

    this.status = BulkActionStatus.Preparing;

    if (redisClient instanceof IORedis.Cluster) {
      this.runners = redisClient.nodes('master').map((node) => new BulkActionRunner(
        this,
        node,
      ));
    } else {
      this.runners = [
        new BulkActionRunner(
          this,
          redisClient,
        ),
      ];
    }

    await Promise.all(this.runners.map((runner) => runner.prepareToStart()));

    this.status = BulkActionStatus.Ready;
  }

  /**
   * Start bulk operation in case if it was prepared before only
   */
  async start() {
    if (this.status !== BulkActionStatus.Ready) {
      throw new Error(`Unable to start bulk action with "${this.status}" status`);
    }

    this.run().catch();

    return this.getOverview();
  }

  /**
   * Run bulk action
   * @private
   */
  private async run() {
    try {
      this.status = BulkActionStatus.Running;

      await Promise.all(this.runners.map((runner) => runner.run()));

      this.status = BulkActionStatus.Completed;
    } catch (e) {
      this.catchRunnerError(e);
    }
  }

  private catchRunnerError(e: Error) {
    // todo: logger
    console.log('___e', e);
    this.setStatus(BulkActionStatus.Failed);
    // todo: exception
  }

  getOverview() {
    const progress = this.runners.map((runner) => runner.getProgress().getOverview())
      .reduce((cur, prev) => ({
        total: prev.total + cur.total,
        scanned: prev.scanned + cur.scanned,
      }), {
        total: 0,
        scanned: 0,
      });

    const summary = this.runners.map((runner) => runner.getSummary().getOverview())
      .reduce((cur, prev) => ({
        processed: prev.processed + cur.processed,
        succeed: prev.succeed + cur.succeed,
        failed: prev.failed + cur.failed,
      }), {
        processed: 0,
        succeed: 0,
        failed: 0,
      });

    return {
      id: this.id,
      status: this.status,
      filter: this.filter,
      progress,
      summary,
    };
  }

  getId() {
    return this.id;
  }

  getStatus(): BulkActionStatus {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
  }

  getFilter(): BulkActionFilter {
    return this.filter;
  }

  getSocket(): Socket {
    return this.socket;
  }

  changeState() {
    this.debounce();
  }

  sendOverview() {
    const overview = this.getOverview();

    try {
      this.socket.emit('overview', overview);
    } catch (e) {
      // todo: log error
    }
  }

  abort() {
    this.status = BulkActionStatus.Aborted;
  }
}
