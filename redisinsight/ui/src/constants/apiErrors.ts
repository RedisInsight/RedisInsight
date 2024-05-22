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

export const AI_CHAT_ERRORS = {
  default: () => 'An error occurred. Try again or restart the session.',
  unexpected: () => 'An unexpected error occurred. Try again later.',
  timeout: () => 'Timeout occurred. Try again later.',
  rateLimit: (limit = 5000) => `Exceeded rate limit. Try again in ${limit} seconds.`,
  tokenLimit: () => 'Conversation is too long. Restart the session.'
}

export default ApiErrors
