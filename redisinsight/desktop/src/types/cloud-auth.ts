export enum CloudAuthStatus {
  Success = 'success',
  Failed = 'failed',
  Pending = 'pending'
}

export interface CloudAuthRequestOptions {
  redirectUrl?: string;
  state?: string;
}

export interface CloudAuthResponse {
  status: CloudAuthStatus;
  error?: string;
}
