import { map, isEqual } from 'lodash'
import { Instance } from 'uiSrc/slices/interfaces'

export const REDISTACK_PORT = 6379
export const REDISTACK_MODULES = ['ReJSON', 'graph', 'timeseries', 'search', 'bf'].sort()

const checkRediStack = (instances: Instance[]): Instance[] => {
  let isRediStack = false

  let newInstances = instances.map((instance) => {
    isRediStack = instance.port === REDISTACK_PORT && isEqual(map(instance.modules, 'name').sort(), REDISTACK_MODULES)
    return {
      ...instance,
      isRediStack
    }
  })

  if (!isRediStack) {
    newInstances = newInstances.map((instance) => ({
      ...instance,
      isRediStack: isEqual(map(instance.modules, 'name').sort(), REDISTACK_MODULES)
    }))
  }

  return newInstances
}

export { checkRediStack }
