export enum CustomErrorCodes {
  // General [10000, 10999]
  WindowUnauthorized = 10_001,

  // Cloud API [11001, 11099]
  CloudApiInternalServerError = 11_000,
  CloudApiUnauthorized = 11_001,
  CloudApiForbidden = 11_002,
  CloudApiBadRequest = 11_003,
  CloudApiNotFound = 11_004,
  CloudOauthMisconfiguration = 11_005,
  CloudOauthGithubEmailPermission = 11_006,
  CloudOauthUnknownAuthorizationRequest = 11_007,
  CloudOauthUnexpectedError = 11_008,
}
