import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';
import IORedis from 'ioredis';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import { IBulkAction } from 'src/modules/bulk-actions/models/bulk-action.interface';
import { BulkActionStatus } from 'src/modules/bulk-actions/contants';

export class BulkActionRunner {
  protected bulkAction: IBulkAction;

  protected progress: BulkActionProgress;

  protected summary: BulkActionSummary;

  protected node: IORedis.Redis;

  constructor(bulkAction, node) {
    this.bulkAction = bulkAction;
    this.node = node;
    this.progress = new BulkActionProgress();
    this.summary = new BulkActionSummary();
  }

  async prepareToStart() {
    // @ts-ignore
    const total = await this.node.sendCommand(new IORedis.Command('dbsize', []));
    this.progress.setTotal(total);
  }

  async run() {
    while (
      this.progress.getCursor() > -1
      && this.bulkAction.getStatus() === BulkActionStatus.Running
    ) {
      await this.runIteration();
    }
  }

  prepareCommands(keys: Buffer[]) {
    return keys.map((key) => [
      'expire',
      [
        key,
        99999999,
      ],
    ]);
  }

  async runIteration() {
    const keys = await this.getKeysToProcess();
    if (keys.length) {
      const commands = this.prepareCommands(keys) as string[][];
      const res = await this.node.pipeline(commands).exec();

      this.processIterationResults(keys, res);
    }
  }

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

  getProgress() {
    return this.progress;
  }

  getSummary() {
    return this.summary;
  }
}
