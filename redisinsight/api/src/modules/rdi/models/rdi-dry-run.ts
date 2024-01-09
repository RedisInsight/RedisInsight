export enum DyRunJobStatus {
  Success = 'success',
  Fail = 'fail',
}

export class RdiDryRunJobResult {
  status: DyRunJobStatus;

  // TODO validate with RDI team
  data?: any;

  error?: string;
}
