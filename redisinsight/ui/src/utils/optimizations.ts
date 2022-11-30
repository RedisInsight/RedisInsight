import { some } from 'lodash'
import { BrowserStorageItem } from 'uiSrc/constants'
import { localStorageService, setDBConfigStorageField } from 'uiSrc/services'
import { Instance } from 'uiSrc/slices/interfaces'

export const optimizeLSInstances = (instances: Instance[]) => {
  try {
    const isOptimized = localStorageService.get('optimizedInstances')
    if (isOptimized) {
      return
    }

    const lsItems = localStorageService.getAll()
    Object.keys(lsItems)
      .forEach((item) => {
        if (item.startsWith(BrowserStorageItem.treeViewDelimiter)) {
          const instanceId = item.replace(BrowserStorageItem.treeViewDelimiter, '')

          if (some(instances, ['id', instanceId])) {
            setDBConfigStorageField(instanceId, BrowserStorageItem.treeViewDelimiter, lsItems[item])
          }

          localStorageService.remove(item)
        }

        if (item.startsWith(BrowserStorageItem.dbConfig)) {
          const instanceId = item.replace(BrowserStorageItem.dbConfig, '')

          if (!some(instances, ['id', instanceId])) {
            localStorageService.remove(item)
          }
        }

        localStorageService.set('optimizedInstances', true)
      })
  } catch (e) {
    console.error(e)
  }
}
