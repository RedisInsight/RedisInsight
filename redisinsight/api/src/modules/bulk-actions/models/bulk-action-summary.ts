export class BulkActionSummary {
  private processed: number = 0;

  private succeed: number = 0;

  private failed: number = 0;

  private errors: Map<string, number> = new Map();

  addProcessed(count: number) {
    this.processed += count;
  }

  addSuccess(count: number) {
    this.succeed += count;
  }

  addErrors(err: string[]) {
    this.failed += err.length;
    err.forEach((error) => {
      if (!this.errors.get(error)) {
        this.errors.set(error, 0);
      }

      this.errors.set(error, this.errors.get(error) + 1);
    });
  }

  getOverview() {
    return {
      processed: this.processed,
      succeed: this.succeed,
      failed: this.failed,
    };
  }
}
