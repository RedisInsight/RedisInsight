import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  fireEvent,
  sessionStorageMock,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { BrowserStorageItem } from 'uiSrc/constants'
import { processCliClient, toggleCli } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sessionStorageService } from 'uiSrc/services'
import CliHeader from './CliHeader'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    host: 'localhost',
    port: 6379,
  }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('CliHeader', () => {
  it('should render', () => {
    expect(render(<CliHeader />)).toBeTruthy()
  })

  it('should "toggleCli" action be called after click "collapse-cli" button', () => {
    render(<CliHeader />)
    fireEvent.click(screen.getByTestId('collapse-cli'))

    const expectedActions = [toggleCli()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should "toggleCli" action be called after click "collapse-cli" button', async () => {
    const mockUuid = 'test-uuid'
    sessionStorageMock.getItem = jest.fn().mockReturnValue(mockUuid)

    render(<CliHeader />)

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('collapse-cli'))
    })

    const expectedActions = [toggleCli()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  // it('should "toggleCliHelper" action be called after click "collapse-cli-helper" button', async () => {
  //   const mockUuid = 'test-uuid'
  //   sessionStorageMock.getItem = jest.fn().mockReturnValue(mockUuid)
  //
  //   render(<CliHeader {...instance(mockedProps)} />)
  //
  //   await waitFor(() => {
  //     fireEvent.click(screen.getByTestId('collapse-cli-helper'))
  //   })
  //
  //   const expectedActions = [toggleCliHelper()]
  //   expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
  // })

  it('should "processCliClient" action be called after unmount with mocked sessionStorage item ', () => {
    const mockUuid = 'test-uuid'
    sessionStorageService.get = jest.fn().mockReturnValue(mockUuid)

    const { unmount } = render(<CliHeader />)

    unmount()

    expect(sessionStorageService.get).toBeCalledWith(BrowserStorageItem.cliClientUuid)

    const expectedActions = [processCliClient()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('Cli endpoint should be equal connected Instance host:port', () => {
    const host = 'localhost'
    const port = 6379
    const endpoint = `${host}:${port}`
    const mockEndpoint = `cli-endpoint-${endpoint}`

    connectedInstanceSelector.mockImplementation(() => ({
      host,
      port,
    }))

    const { queryByTestId } = render(<CliHeader />)

    const endpointEl = queryByTestId(mockEndpoint)

    expect(endpointEl).toBeInTheDocument()
    expect(endpointEl).toHaveTextContent(endpoint)
  })
})
