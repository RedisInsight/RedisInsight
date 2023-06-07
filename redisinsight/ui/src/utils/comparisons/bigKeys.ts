import { KeyTypes } from 'uiSrc/constants'

enum HighlightType {
  Length = 'length',
  Memory = 'memory'
}

interface DefaultConfig { [key: string]: number }

const defaultMemoryConfig: { [key: string]: number } = {
  memory: 5_000_000
}

const defaultConfig: { [key: string]: number } = {
  length: 5_000,
  memory: 5_000_000
}

const bigKeysConfig: { [key: string]: DefaultConfig } = {
  // TODO: rollback to enum [KeyTypes.Hash]: ....
  // TODO: import this enum not work well for packaged electron
  list: defaultConfig,
  zset: defaultConfig,
  set: defaultConfig,
  hash: defaultConfig,
}

const isBigKey = (keyType: string, type: HighlightType, count: number): boolean => {
  if (!count) return false
  if (bigKeysConfig[keyType]?.[type]) return count >= bigKeysConfig[keyType][type]
  if (defaultMemoryConfig[type]) return count >= defaultMemoryConfig[type]

  return false
}

export {
  HighlightType,
  isBigKey
}
