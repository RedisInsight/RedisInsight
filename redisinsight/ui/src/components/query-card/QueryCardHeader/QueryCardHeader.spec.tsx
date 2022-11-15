import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, fireEvent, act, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'
import QueryCardHeader, { Props } from './QueryCardHeader'

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

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: []
  }),
}))

describe('QueryCardHeader', () => {
  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<QueryCardHeader {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should render tooltip in milliseconds', async () => {
    render(<QueryCardHeader {...instance(mockedProps)} executionTime={12345678910} />)

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('command-execution-time-icon'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.getByTestId('execution-time-tooltip')).toHaveTextContent('12 345 678.91 ms')
  })
})
