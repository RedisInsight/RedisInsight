import { isArray, map } from 'lodash'
import { Instance, RedisDefaultModules } from 'uiSrc/slices/interfaces'

export const REDISTACK_PORT = 6379
export const REDISTACK_MODULES: Array<string | Array<string>> = [
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.Bloom,
  RedisDefaultModules.Graph,
  [RedisDefaultModules.Search, RedisDefaultModules.SearchLight],
  RedisDefaultModules.TimeSeries,
]

const checkRediStackModules = (modules: any[]) => {
  if (!modules?.length || modules.length !== REDISTACK_MODULES.length) return false

  return map(modules, 'name')
    .sort()
    .every((m, index) => (isArray(REDISTACK_MODULES[index])
      ? (REDISTACK_MODULES[index] as Array<string>).some((rm) => rm === m)
      : REDISTACK_MODULES[index] === m))
}

const checkRediStack = (instances: Instance[]): Instance[] => {
  let isRediStackCheck = false

  let newInstances = instances.map((instance) => {
    const isRediStack = +instance.port === REDISTACK_PORT && checkRediStackModules(instance.modules)

    isRediStackCheck = isRediStackCheck || isRediStack
    return {
      ...instance,
      isRediStack
    }
  })

  // if no any database with redistack on port 6379 - mark others as redistack (with modules check)
  if (!isRediStackCheck) {
    newInstances = newInstances.map((instance) => ({
      ...instance,
      isRediStack: checkRediStackModules(instance.modules)
    }))
  }

  return newInstances
}

export { checkRediStack, checkRediStackModules }
