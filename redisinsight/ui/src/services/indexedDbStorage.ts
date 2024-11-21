export class IndexedDbStorage {
  private db?: IDBDatabase

  constructor(private readonly dbName: string, private readonly version = 1, private readonly keySeparator = ':') {
  }

  private initDb(storeName: string) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('indexedDB is not supported'))
      }
      // Let us open our database
      const DBOpenRequest = window.indexedDB.open(this.dbName, this.version)

      DBOpenRequest.onerror = (event) => {
        event.preventDefault()
        reject(DBOpenRequest.error)
        console.error('indexedDB open error')
      }

      DBOpenRequest.onsuccess = () => {
        this.db = DBOpenRequest.result
        this.db.onversionchange = (e) => {
          // Triggered when the database is modified (e.g. adding an objectStore) or
          // deleted (even when initiated by other sessions in different tabs).
          // Closing the connection here prevents those operations from being blocked.
          // If the database is accessed again later by this instance, the connection
          // will be reopened or the database recreated as needed.
          (e.target as IDBDatabase)?.close()
        }
        resolve(this.db)
      }

      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      // it is only implemented in recent browsers
      DBOpenRequest.onupgradeneeded = (event) => {
        this.db = DBOpenRequest.result

        this.db.onerror = (event) => {
          event.preventDefault()
          reject(DBOpenRequest.error)
        }

        try {
          if (event.newVersion && event.newVersion > event.oldVersion
            && event.oldVersion > 0
            && this.db.objectStoreNames.contains(storeName)) {
            // if there is need to update
            this.db.deleteObjectStore(storeName)
          }
          // Create an objectStore for this database
          const objectStore = this.db.createObjectStore(storeName, { keyPath: ['dbId', 'commandId'] })
          objectStore.createIndex('dbId', 'dbId', { unique: true })
          objectStore.createIndex('commandId', 'commandId', { unique: true })
        } catch (ex) {
          if (ex instanceof DOMException && ex?.name === 'ConstraintError') {
            console.warn(
              `The database "${this.dbName}" has been upgraded from version ${event.oldVersion} to version 
              ${event.newVersion}, but the storage "${storeName}" already exists.`,
            )
          } else {
            throw ex
          }
        }
      }
    })
  }

  async getDb(storeName: string) {
    if (!this.db) {
      await this.initDb(storeName)
    }
    return this.db
  }

  getItem(key: string) {
    return new Promise((resolve, reject) => {
      try {
        const {
          storeName,
          keyName: nKey,
        } = this._parseKey(key)
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to retrieve item from IndexedDB'))
            return
          }
          const req = db.transaction(storeName, 'readonly')?.objectStore(storeName)?.getAll(nKey)
          if (req) {
            req.onsuccess = () => {
              console.log('success', req.result)
              resolve(req.result)
            }
            req.onerror = () => {
              reject(req.error)
            }
          } else {
            reject(new Error('Failed to retrieve item from IndexedDB'))
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  setItem(storeName: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to set item in IndexedDB'))
            return
          }
          const transaction = db.transaction(storeName, 'readwrite')

          const req = transaction?.objectStore(storeName)?.put(value)
          transaction.oncomplete = () => {
            resolve()
          }
          transaction.onerror = () => {
            reject(req?.error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const {
          storeName,
          keyName: nKey,
        } = this._parseKey(key)
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to remove item from IndexedDB'))
            return
          }
          const transaction = db.transaction(storeName, 'readwrite')
          const req = transaction.objectStore(storeName)?.delete(nKey)

          transaction.oncomplete = () => {
            resolve()
          }

          transaction.onerror = () => {
            reject(req?.error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.getDb(storeName).then((db) => {
          if (db === undefined) {
            reject(new Error('Failed to clear items in IndexedDB'))
            return
          }
          const transaction = db.transaction(storeName, 'readwrite')
          const req = transaction?.objectStore(storeName).clear()
          transaction.oncomplete = () => {
            resolve()
          }
          transaction.onabort = () => {
            reject(req?.error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Parses the given key by normalizing it and splitting it using the key separator.
   * Key can consist of <storeName>:<keyId> potentially more items
   * @param {unknown} key - The key to be parsed.
   */
  private _parseKey(key: unknown) {
    const nKey = this._normalizeKey(key)

    const [storeName, keyName] = nKey.split(this.keySeparator)
    return {
      storeName,
      keyName,
    }
  }

  private _normalizeKey(key: unknown) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
      console.warn(`${key} used as a key, but it is not a string.`)
      return String(key)
    }

    return key
  }
}
