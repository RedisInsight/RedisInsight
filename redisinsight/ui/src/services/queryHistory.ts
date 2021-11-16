/*
 * History Container can store an array of data of type `T`. The
 * container name provided must be unique since all the data in the
 * container is persisted to local store under a key. It also exposes
 * some utility APIs.
 */
import { cloneDeep } from 'lodash'

import { localStorageService } from './storage'

export interface IHistoryObject {
  query: string;
  id: number;
  data: any;
  fromPersistentStore?: boolean;
}

export default class HistoryContainer<T extends IHistoryObject> {
  private data: T[] = []

  private readonly CONTAINER_KEY_PREFIX = 'HISTORY_CONTAINER_'

  private containerKey: string

  constructor(keyName: string = '', cont?: T[]) {
    this.containerKey = keyName
    const persistKey = this.CONTAINER_KEY_PREFIX + this.containerKey
    if (cont) {
      this.data = [...cont]
      this.updateStore()
    } else {
      this.data = localStorageService.get(persistKey) ?? []
    }
  }

  /*
   * Retrieve data else return empty Array of type `T`
   */
  getData(): T[] {
    return [...this.data]
  }

  updateStore() {
    const persistKey = this.CONTAINER_KEY_PREFIX + this.containerKey
    localStorageService.set(
      persistKey,
      cloneDeep(this.data).map((x) => ({
        ...x,
        data: undefined,
        time: null,
        matched: null,
        fromPersistentStore: true,
      }))
    )
  }

  /*
   * Append a data entry to the container
   */
  pushData(data: T): void {
    this.data.unshift(data)
    this.updateStore()
  }

  /*
   * Return the length of the history container
   */
  getLength(): number {
    return this.getData().length
  }

  // /*
  //  * Replace the container data with the provided data
  //  */
  // replaceData(data: T[]): HistoryContainer<T> {
  //   const { containerKey } = this;

  //   return new HistoryContainer<T>(containerKey, data);
  // }

  /*
   * Check whether container has an item with the given id
   */
  hasId(id: number): boolean {
    const keyData = this.getData()

    return keyData.findIndex((item) => item.id === id) !== -1
  }

  /*
   * Replace history data whose id equals `id` with `data`
   */
  replaceHistoryItem(id: number, data: T): void {
    this.data = this.data.map((item) => {
      if (item.id === id) {
        return data
      }
      return item
    })
    this.updateStore()
  }

  /*
   * Delete an history item
   */
  deleteHistoryItem(id: number): void {
    this.data = this.data.filter((item) => item.id !== id)
    this.updateStore()
  }

  /*
   * Delete an history last item
   */
  deleteHistoryLastItem(): void {
    this.data.pop()
    this.updateStore()
  }

  // /*
  //  * Clear the history
  //  */
  // clearHistory(): HistoryContainer<T> {
  //   return this.replaceData([] as T[]);
  // }
}
