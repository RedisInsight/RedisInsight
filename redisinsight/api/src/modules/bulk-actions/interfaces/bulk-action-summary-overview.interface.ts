export interface IBulkActionSummaryOverview {
  processed: number,
  succeed: number,
  failed: number,
  errors: Array<Record<string, string>>
}
