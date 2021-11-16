import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import HistoryContainer from 'uiSrc/services/queryHistory'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBResultsWrapper, { Props } from './WBResultsWrapper'

import { WORKBENCH_HISTORY_WRAPPER_NAME } from '../../constants'
import { WBHistoryObject } from '../../interfaces'

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

describe('WBResultsWrapper', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<WBResultsWrapper {...instance(mockedProps)} history={history} />)).toBeTruthy()
  })
})
