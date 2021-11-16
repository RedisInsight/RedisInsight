import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import WorkbenchPage from './WorkbenchPage'

jest.mock('./components/wb-view', () => 'WBViewWrapper')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: []
  }),
}))

describe('WorkbenchPage', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<WorkbenchPage />)).toBeTruthy()
  })
})
