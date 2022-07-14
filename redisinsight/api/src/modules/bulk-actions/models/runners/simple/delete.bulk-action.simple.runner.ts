import {
  AbstractBulkActionSimpleRunner,
} from 'src/modules/bulk-actions/models/runners/simple/abstract.bulk-action.simple.runner';

export class DeleteBulkActionSimpleRunner extends AbstractBulkActionSimpleRunner {
  prepareCommands(keys: Buffer[]) {
    return keys.map((key) => [
      'del',
      [
        key,
      ],
    ]);
  }
}
