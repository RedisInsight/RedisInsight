import { BulkAction } from 'src/modules/bulk-actions/models/bulk-action';
import IORedis from 'ioredis';

export class BulkDeleteSimple extends BulkAction {
  async runNodeIteration(nodeClient: IORedis.Redis, cursor: number) {
    // @ts-ignore
    return nodeClient.sendCommand(new IORedis.Command(
      'scan',
      // [cursor, ...this.filter.getScanArgsArray()],
      [],
    ));
  }
}
