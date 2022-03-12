import { map, isEqual } from 'lodash'
import { Instance } from 'uiSrc/slices/interfaces'

export const REDISTACK_PORT = 6379
export const REDISTACK_MODULES = ['ReJSON', 'graph', 'timeseries', 'search', 'bf'].sort()

const checkRediStackModules = (modules: any[]) => isEqual(map(modules, 'name').sort(), REDISTACK_MODULES)

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

  if (!isRediStackCheck) {
    newInstances = newInstances.map((instance) => ({
      ...instance,
      isRediStack: checkRediStackModules(instance.modules)
    }))
  }

  return newInstances
}

export { checkRediStack }
