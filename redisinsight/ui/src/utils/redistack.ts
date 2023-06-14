import { isArray, map, concat } from 'lodash'
import { Instance, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { ServerVersions } from 'uiSrc/constants'
import { isVersionHigherOrEquals, Nullable } from 'uiSrc/utils'

export const REDISTACK_DEFAULT_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  RedisDefaultModules.Graph,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

export const REDISTACK_REQUIRED_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

export const REDISTACK_OPTIONAL_MODULES: Array<string> = [
  RedisDefaultModules.Gears,
]

const checkRediStackModules = (modules: any[], required: any[], optional: any[] = []) => {
  if (!modules?.length) return false

  if (modules.length === required.length) {
    return map(modules, 'name')
      .sort()
      .every((m, index) => (isArray(required[index])
        ? (required[index] as Array<string>).some((rm) => rm === m)
        : required[index] === m))
  }

  if (modules.length === (required.length + optional.length)) {
    const rediStackModules = concat(required, optional).sort()
    return map(modules, 'name')
      .sort()
      .every((m, index) => (isArray(rediStackModules[index])
        ? (rediStackModules[index] as Array<string>).some((rm) => rm === m)
        : rediStackModules[index] === m))
  }

  return false
}

const isRediStack = (modules: any[], version?: Nullable<string>): boolean => {
  if (!version) {
    return checkRediStackModules(modules, REDISTACK_DEFAULT_MODULES)
  }

  if (isVersionHigherOrEquals(version, ServerVersions.SERVER_VERSION)) {
    return checkRediStackModules(modules, REDISTACK_REQUIRED_MODULES, REDISTACK_OPTIONAL_MODULES)
  }

  if (isVersionHigherOrEquals(version, ServerVersions.MIN_SERVER_VERSION)) {
    return checkRediStackModules(modules, REDISTACK_DEFAULT_MODULES)
  }

  return false
}

const checkRediStack = (instances: Instance[]): Instance[] => (instances.map((instance) => ({
  ...instance,
  isRediStack: isRediStack(instance.modules)
})))

export { checkRediStack, isRediStack }
