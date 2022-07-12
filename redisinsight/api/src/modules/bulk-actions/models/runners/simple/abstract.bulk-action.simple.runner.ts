import IORedis from 'ioredis';
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
    // @ts-ignore
    const total = await this.node.sendCommand(new IORedis.Command('dbsize', []));
    this.progress.setTotal(total);
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
    if (keys.length) {
      const commands = this.prepareCommands(keys) as string[][];
      const res = await this.node.pipeline(commands).exec();
      this.processIterationResults(keys, res);
    }
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
    this.progress.addScanned(this.bulkAction.getFilter().getCount());
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
    this.bulkAction.changeState();
  }
}
