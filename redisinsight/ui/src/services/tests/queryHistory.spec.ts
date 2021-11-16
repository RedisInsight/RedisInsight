import { cloneDeep } from 'lodash'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { waitFor } from 'uiSrc/utils/test-utils'
import HistoryContainer from '../queryHistory'

type T = WBHistoryObject

let history: HistoryContainer<T>
beforeEach(() => {
  history = cloneDeep(new HistoryContainer<T>(`SEARCH_HISTORY_WRAPPER_NAME_${Math.random()}`))
})

describe('queryHistory', () => {
  it('getData should return all data', async () => {
    const data: T = {
      query: 'query',
      data: 'data',
      id: Date.now(),
    }
    const newHistory = cloneDeep(history)

    await waitFor(() => {
      newHistory.pushData(data)
    })

    expect(newHistory.getData()).toEqual([data])
  })

  it('pushData should add data entry to the container ', async () => {
    const data: T = {
      query: 'query',
      data: 'data',
      id: Date.now(),
    }
    const newHistory = cloneDeep(history)
    newHistory.pushData(data)

    expect(newHistory.getData().length).toEqual(1)

    await waitFor(() => {
      newHistory.pushData(data)
      newHistory.pushData(data)
      newHistory.pushData(data)
    })

    expect(newHistory.getData().length).toEqual(4)
  })

  it('getLength should return the length of the history', async () => {
    const data: T = {
      query: 'query',
      data: 'data',
      id: Date.now(),
    }
    const newHistory = cloneDeep(history)

    await waitFor(() => {
      newHistory.pushData(data)
      newHistory.pushData(data)
      newHistory.pushData(data)
    })

    expect(newHistory.getLength()).toEqual(3)
  })

  it('hasId should check whether container has an item with the given id', () => {
    const id = Date.now()
    const data: T = {
      query: 'query',
      data: 'data',
      id,
    }
    const newHistory = cloneDeep(history)
    newHistory.pushData(data)
    const isHasId = newHistory.hasId(id)
    const isHasNotId = newHistory.hasId(123)

    expect(isHasId).toBeTruthy()
    expect(isHasNotId).not.toBeTruthy()
  })

  it('replaceHistoryItem should replace history data whose id equals `id` with `data`', () => {
    const id = Date.now()
    const id2 = 123
    const data: T = {
      query: 'query',
      data: 'data',
      id,
    }
    const newHistory = cloneDeep(history)
    newHistory.pushData(data)

    newHistory.replaceHistoryItem(id, { ...data, id: id2 })

    expect(newHistory.getData()[0]).toEqual({ ...data, id: id2 })
  })

  it('deleteHistoryLastItem should delete an history last item', async () => {
    const data: T = {
      query: 'query',
      data: 'data',
      id: 1,
    }
    const newHistory = cloneDeep(history)

    await waitFor(() => {
      newHistory.pushData(data)
      newHistory.pushData({ ...data, id: data.id + 1 })
      newHistory.pushData({ ...data, id: data.id + 2 })

      newHistory.deleteHistoryLastItem()
      newHistory.deleteHistoryLastItem()
    })

    expect(newHistory.getData().length).toEqual(1)
  })

  it('deleteHistoryItem should delete an history item by id', async () => {
    const data: T = {
      query: 'query',
      data: 'data',
      id: 1,
    }

    const findingId = data.id + 1
    const newHistory = cloneDeep(history)

    await waitFor(() => {
      newHistory.pushData(data)
      newHistory.pushData({ ...data, id: findingId })
      newHistory.pushData({ ...data, id: findingId + 2 })
      newHistory.deleteHistoryItem(findingId)
    })

    const historyData = newHistory.getData()

    expect(historyData.find(({ id }) => id === findingId)).toBeFalsy()
  })
})
