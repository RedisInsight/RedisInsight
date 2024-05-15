enum ApiErrors {
  SentinelParamsRequired = 'SENTINEL_PARAMS_REQUIRED',
  KeytarUnavailable = 'KeytarUnavailable',
  KeytarEncryption = 'KeytarEncryptionError',
  KeytarDecryption = 'KeytarDecryptionError',
  ClientNotFound = 'ClientNotFoundError',
  RedisearchIndexNotFound = 'no such index',
}

export const ApiEncryptionErrors: string[] = [
  ApiErrors.KeytarUnavailable,
  ApiErrors.KeytarEncryption,
  ApiErrors.KeytarDecryption,
]

export enum AiChatErrors {
  Default = 'An error occurred. Try again or restart the session.',
  DefaultUnexpected = 'An unexpected error occurred. Try again later.',
  Timeout = 'Timeout occurred. Try again later.',
  CloudAuthorization = 'Session expired. Login and try again'
}

export default ApiErrors
