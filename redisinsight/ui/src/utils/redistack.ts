import { isArray, map, concat } from 'lodash'
import { Instance, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { isVersionHigherOrEquals, Nullable } from 'uiSrc/utils'

const REDISTACK_LOW_VERSION = '6.2.6'
const REDISTACK_HIGH_VERSION = '7.1'

const REDISTACK_LOW_VERSION_REQUIRE_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  RedisDefaultModules.Graph,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

const REDISTACK_HIGH_VERSION_REQUIRE_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

const REDISTACK_HIGH_VERSION_OPTIONAL_MODULES: Array<string> = [
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
    return checkRediStackModules(modules, REDISTACK_LOW_VERSION_REQUIRE_MODULES)
  }

  if (isVersionHigherOrEquals(version, REDISTACK_HIGH_VERSION)) {
    return checkRediStackModules(
      modules,
      REDISTACK_HIGH_VERSION_REQUIRE_MODULES,
      REDISTACK_HIGH_VERSION_OPTIONAL_MODULES
    )
  }

  if (isVersionHigherOrEquals(version, REDISTACK_LOW_VERSION)) {
    return checkRediStackModules(modules, REDISTACK_LOW_VERSION_REQUIRE_MODULES)
  }

  return false
}

const checkRediStack = (instances: Instance[]): Instance[] => (instances.map((instance) => ({
  ...instance,
  isRediStack: isRediStack(instance.modules, instance.version)
})))

export { checkRediStack, isRediStack }
