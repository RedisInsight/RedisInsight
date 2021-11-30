import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { WBHistoryObject } from 'uiSrc/pages/workbench/interfaces'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBResults, { Props } from './WBResults'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
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

    expect(render(<WBResults {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render with custom props', () => {
    const historyItemsMock: WBHistoryObject[] = [
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

    expect(render(<WBResults {...instance(mockedProps)} historyItems={historyItemsMock} />)).toBeTruthy()
  })

  it('should not render NoResults component with empty history', () => {
    const { getByTestId } = render(<WBResults {...instance(mockedProps)} historyItems={[]} />)

    expect(getByTestId('wb_no-results')).toBeInTheDocument()
  })

  it('should render NoResults component with history', () => {
    const historyItemsMock: WBHistoryObject[] = [{
      query: 'query1',
      data: 'data1',
      id: 1,
      fromPersistentStore: true,
    }]

    const { queryByTestId } = render(<WBResults {...instance(mockedProps)} historyItems={historyItemsMock} />)

    const noResultsEl = queryByTestId('wb_no-results')

    expect(noResultsEl).not.toBeInTheDocument()
  })
})
