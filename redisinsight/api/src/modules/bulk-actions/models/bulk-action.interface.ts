import { BulkActionStatus } from 'src/modules/bulk-actions/contants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';

export interface IBulkAction {
  getStatus(): BulkActionStatus;
  getFilter(): BulkActionFilter;
  changeState(): void;
}
