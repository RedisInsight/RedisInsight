import { isObjectLike } from 'lodash'
import BrowserStorageItem from '../constants/storage'

class StorageService {
  private storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  get(itemName: string = '') {
    let item
    try {
      item = this.storage.getItem(itemName)
    } catch (error) {
      console.error(`getItem from storage error: ${error}`)
    }

    if (item) {
      try {
        return JSON.parse(item)
      } catch (e) {
        return item
      }
    }
    return null
  }

  getAll() {
    return this.storage
  }

  set(itemName: string = '', item: any) {
    try {
      if (isObjectLike(item)) {
        this.storage.setItem(itemName, JSON.stringify(item))
      } else {
        this.storage.setItem(itemName, item)
      }
    } catch (error) {
      console.error(`setItem to storage error: ${error}`)
    }
  }

  remove(itemName: string = '') {
    this.storage.removeItem(itemName)
  }
}
export const localStorageService = new StorageService(localStorage)
export const sessionStorageService = new StorageService(sessionStorage)

export const getObjectStorageField = (itemName = '', field = '') => {
  try {
    return localStorageService?.get(itemName)?.[field]
  } catch (e) {
    return null
  }
}

export const setObjectStorageField = (itemName = '', field = '', value?: any) => {
  try {
    const config = localStorageService?.get(itemName) || {}

    if (value === undefined) {
      delete config[field]
      localStorageService?.set(itemName, config)
      return
    }

    localStorageService?.set(itemName, {
      ...config,
      [field]: value
    })
  } catch (e) {
    console.error(e)
  }
}

export const getDBConfigStorageField = (instanceId: string, field: string = '') =>
  getObjectStorageField(BrowserStorageItem.dbConfig + instanceId, field)

export const setDBConfigStorageField = (instanceId: string, field: string = '', value?: any) => {
  setObjectStorageField(BrowserStorageItem.dbConfig + instanceId, field, value)
}

export const getCapabilityStorageField = (field: string = '') =>
  getObjectStorageField(BrowserStorageItem.capability, field)

export const setCapabilityStorageField = (field: string = '', value?: any) => {
  setObjectStorageField(BrowserStorageItem.capability, field, value)
}

export default StorageService
