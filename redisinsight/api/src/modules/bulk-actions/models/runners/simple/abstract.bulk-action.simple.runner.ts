import * as IORedis from 'ioredis';
import { get } from 'lodash';
import { convertBulkStringsToObject, convertRedisInfoReplyToObject } from 'src/utils';
import { BulkActionStatus } from 'src/modules/bulk-actions/contants';
import { AbstractBulkActionRunner } from 'src/modules/bulk-actions/models/runners/abstract.bulk-action.runner';

export abstract class AbstractBulkActionSimpleRunner extends AbstractBulkActionRunner {
  protected node: IORedis.Redis;

  constructor(bulkAction, node) {
    super(bulkAction);
    this.node = node;
  }

  /**
   * Commands to be executed in a pipeline
   * @param keys
   */
  abstract prepareCommands(keys: Buffer[]);

  /**
   * @inheritDoc
   */
  async prepareToStart() {

    const keyspaceInfo = convertRedisInfoReplyToObject(
      // @ts-ignore
      await this.node.sendCommand(new IORedis.Command('info', ['keyspace'], { replyEncoding: 'utf8' }))
    );
    const dbInfo = get(keyspaceInfo, 'keyspace', {})
    if (!dbInfo[`db${this.node.options.db}`]) {
      this.progress.setTotal(0);

    } else {
      const { keys } = convertBulkStringsToObject(dbInfo[`db${this.node.options.db}`], ',', '=');
      this.progress.setTotal(parseInt(keys, 10));
    }
  }

  /**
   * @inheritDoc
   */
  async run() {
    while (
      this.progress.getCursor() > -1
      && this.bulkAction.getStatus() === BulkActionStatus.Running
    ) {
      await this.runIteration();
    }
  }

  /**
   * Just run single iteration for some batch of keys and process results
   */
  async runIteration() {
    const keys = await this.getKeysToProcess();
    this.progress.addScanned(this.bulkAction.getFilter().getCount());

    if (keys.length) {
      const commands = this.prepareCommands(keys) as string[][];
      const res = await this.node.pipeline(commands).exec();
      // @ts-expect-error
      // https://github.com/luin/ioredis/issues/1572
      this.processIterationResults(keys, res);
    }

    this.bulkAction.changeState();
  }

  /**
   * Get batch of keys to process
   */
  async getKeysToProcess(): Promise<Buffer[]> {
    if (this.progress.getCursor() < 0) {
      return [];
    }
    // @ts-ignore
    const [cursorBuffer, keys] = await this.node.sendCommand(new IORedis.Command(
      'scan',
      [this.progress.getCursor(), ...this.bulkAction.getFilter().getScanArgsArray()],
    ));

    const cursor = parseInt(cursorBuffer, 10);
    this.progress.setCursor(cursor);

    return keys;
  }

  /**
   * Process results
   * @param keys
   * @param res
   */
  processIterationResults(keys, res: (string | number | null)[][]) {
    this.summary.addProcessed(res.length);

    const errors = [];

    res.forEach((commandResult, i) => {
      if (commandResult[0]) {
        errors.push({ key: keys[i], error: commandResult[0] as string });
      } else {
        this.summary.addSuccess(1);
      }
    });

    this.summary.addErrors(errors);
  }
}
