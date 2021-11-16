import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { WORKBENCH_HISTORY_WRAPPER_NAME } from 'uiSrc/pages/workbench/constants'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import HistoryContainer from 'uiSrc/services/queryHistory'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBResults, { Props } from './WBResults'

const mockedProps = mock<Props>()

let store: typeof mockedStore
let history: HistoryContainer<WBHistoryObject>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  history = new HistoryContainer<WBHistoryObject>(WORKBENCH_HISTORY_WRAPPER_NAME)
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('WBResults', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<WBResults {...instance(mockedProps)} history={history} />)).toBeTruthy()
  })

  it('should render with custom props', () => {
    const historyObjectsMock: WBHistoryObject[] = [
      {
        query: 'query1',
        data: 'data1',
        id: 1,
        fromPersistentStore: true,
      },
      {
        query: 'query2',
        data: 'data2',
        id: 2,
        fromPersistentStore: true,
      },
    ]

    const historyProp = {
      getData: () => historyObjectsMock,
    }

    expect(render(<WBResults {...instance(mockedProps)} history={historyProp} />)).toBeTruthy()
  })
})
