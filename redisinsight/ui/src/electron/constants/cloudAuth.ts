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
