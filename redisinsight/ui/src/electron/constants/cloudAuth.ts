export enum CloudAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export interface CloudAuthResponse {
  status: CloudAuthStatus
  message?: string
  error?: object | string
}

export enum CloudAuthSocial {
  Github = 'github',
  Google = 'google',
}

export enum CloudJobStatus {
  Initializing = 'initializing',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export enum CloudJobs {
  CREATE_FREE_DATABASE = 'CREATE_FREE_DATABASE'
}
