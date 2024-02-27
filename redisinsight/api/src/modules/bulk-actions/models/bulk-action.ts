import { debounce } from 'lodash';
import { BulkActionStatus, BulkActionType } from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IBulkAction, IBulkActionRunner } from 'src/modules/bulk-actions/interfaces';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { RedisClient, RedisClientNodeRole } from 'src/modules/redis/client';

export class BulkAction implements IBulkAction {
  private logger: Logger = new Logger('BulkAction');

  private startTime: number = Date.now();

  private endTime: number;

  private error: Error;

  private status: BulkActionStatus;

  private runners: IBulkActionRunner[] = [];

  private readonly debounce: Function;

  constructor(
    private readonly id: string,
    private readonly databaseId: string,
    private readonly type: BulkActionType,
    private readonly filter: BulkActionFilter,
    private readonly socket: Socket,
    private readonly analytics: BulkActionsAnalytics,
  ) {
    this.debounce = debounce(this.sendOverview.bind(this), 1000, { maxWait: 1000 });
    this.status = BulkActionStatus.Initialized;
  }

  /**
   * Setup runners and fetch total keys once before run
   * @param redisClient
   * @param RunnerClassName
   */
  async prepare(redisClient: RedisClient, RunnerClassName) {
    if (this.status !== BulkActionStatus.Initialized) {
      throw new Error(`Unable to prepare bulk action with "${this.status}" status`);
    }

    this.status = BulkActionStatus.Preparing;

    this.runners = (await redisClient.nodes(RedisClientNodeRole.PRIMARY)).map((node) => new RunnerClassName(
      this,
      node,
    ));

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
   * Run bulk action on each runner
   * @private
   */
  private async run() {
    try {
      this.setStatus(BulkActionStatus.Running);

      await Promise.all(this.runners.map((runner) => runner.run()));

      this.setStatus(BulkActionStatus.Completed);
    } catch (e) {
      this.logger.error('Error on BulkAction Runner', e);
      this.error = e;
      this.setStatus(BulkActionStatus.Failed);
    }
  }

  /**
   * Get overview for BulkAction with progress details and summary
   */
  getOverview(): IBulkActionOverview {
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
        errors: prev.errors.concat(cur.errors),
      }), {
        processed: 0,
        succeed: 0,
        failed: 0,
        errors: [],
      });

    summary.errors = summary.errors.slice(0, 500).map((error) => ({
      key: error.key.toString(),
      error: error.error.toString(),
    }));

    return {
      id: this.id,
      databaseId: this.databaseId,
      type: this.type,
      duration: (this.endTime || Date.now()) - this.startTime,
      status: this.status,
      filter: this.filter.getOverview(),
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
    switch (this.status) {
      case BulkActionStatus.Completed:
      case BulkActionStatus.Failed:
      case BulkActionStatus.Aborted:
        return;
      default:
        this.status = status;
    }

    switch (status) {
      case BulkActionStatus.Aborted:
      case BulkActionStatus.Failed:
      case BulkActionStatus.Completed:
        if (!this.endTime) {
          this.endTime = Date.now();
        }
      // eslint-disable-next-line no-fallthrough
      default:
        this.changeState();
    }
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

  /**
   * Send overview to a client
   */
  sendOverview() {
    const overview = this.getOverview();
    if (overview.status === BulkActionStatus.Completed) {
      this.analytics.sendActionSucceed(overview);
    }
    if (overview.status === BulkActionStatus.Failed) {
      this.analytics.sendActionFailed(overview, this.error);
    }
    if (overview.status === BulkActionStatus.Aborted) {
      this.analytics.sendActionStopped(overview);
    }
    try {
      this.socket.emit('overview', overview);
    } catch (e) {
      this.logger.error('Unable to send overview', e);
    }
  }
}
