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

  addErrors(err: Array<Record<string, string>>) {
    if (err.length) {
      this.failed += err.length;

      this.errors = err.concat(this.errors).slice(0, 500);
    }
  }

  getOverview() {
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
