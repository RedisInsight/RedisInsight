export enum BulkActionsServerEvents {
  Create = 'create',
  Get = 'get',
  Abort = 'abort',
}

export enum BulkActionType {
  Delete = 'delete',
  Import = 'import',
}

export enum BulkActionStatus {
  Initializing = 'initializing',
  Initialized = 'initialized',
  Preparing = 'preparing',
  Ready = 'ready',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Aborted = 'aborted',
}
