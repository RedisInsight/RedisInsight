enum ApiErrors {
  SentinelParamsRequired = 'SENTINEL_PARAMS_REQUIRED',
  KeytarUnavailable = 'KeytarUnavailable',
  KeytarEncryption = 'KeytarEncryptionError',
  KeytarDecryption = 'KeytarDecryptionError',
}

export const ApiEncryptionErrors: string[] = [
  ApiErrors.KeytarUnavailable,
  ApiErrors.KeytarEncryption,
  ApiErrors.KeytarDecryption,
]

export default ApiErrors
