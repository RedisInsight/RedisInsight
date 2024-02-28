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
  CloudOauthMissedRequiredData = 11_009,
  CloudCapiUnauthorized = 11_021,
  CloudCapiKeyUnauthorized = 11_022,
  CloudCapiKeyNotFound = 11_023,

  // Cloud Job errors [11100, 11199]
  CloudJobUnexpectedError = 11_100,
  CloudJobAborted = 11_101,
  CloudJobUnsupported = 11_102,
  CloudTaskProcessingError = 11_103,
  CloudTaskNoResourceId = 11_104,
  CloudSubscriptionIsInTheFailedState = 11_105,
  CloudSubscriptionIsInUnexpectedState = 11_106,
  CloudDatabaseIsInTheFailedState = 11_107,
  CloudDatabaseAlreadyExistsFree = 11_108,
  CloudDatabaseIsInUnexpectedState = 11_109,
  CloudPlanUnableToFindFree = 11_110,
  CloudSubscriptionUnableToDetermine = 11_111,
  CloudTaskNotFound = 11_112,
  CloudJobNotFound = 11_113,
  CloudSubscriptionAlreadyExistsFree = 11_114,

  // General database errors [11200, 11299]
  DatabaseAlreadyExists = 11_200,

  // AI errors [11300, 11399]
  ConvAiInternalServerError = 11_300,
  ConvAiUnauthorized = 11_301,
  ConvAiForbidden = 11_302,
  ConvAiBadRequest = 11_303,
  ConvAiNotFound = 11_304,

  QueryAiInternalServerError = 11_351,
  QueryAiUnauthorized = 11_351,
  QueryAiForbidden = 11_352,
  QueryAiBadRequest = 11_353,
  QueryAiNotFound = 11_354,
}
