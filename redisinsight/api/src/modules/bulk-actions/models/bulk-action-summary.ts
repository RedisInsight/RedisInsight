import { IBulkActionSummaryOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-summary-overview.interface';

export class BulkActionSummary {
  private processed: number = 0;

  private succeed: number = 0;

  private failed: number = 0;

  private errors: Array<Record<string, string>> = [];

  addProcessed(count: number) {
    this.processed += count;
  }

  addSuccess(count: number) {
    this.succeed += count;
  }

  addFailed(count: number) {
    this.failed += count;
  }

  addErrors(err: Array<Record<string, string>>) {
    if (err.length) {
      this.failed += err.length;

      this.errors = err.concat(this.errors).slice(0, 500);
    }
  }

  getOverview(): IBulkActionSummaryOverview {
    const overview = {
      processed: this.processed,
      succeed: this.succeed,
      failed: this.failed,
      errors: this.errors,
    };

    this.errors = [];

    return overview;
  }
}
