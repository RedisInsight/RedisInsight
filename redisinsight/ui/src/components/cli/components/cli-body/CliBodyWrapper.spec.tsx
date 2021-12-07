import React from 'react'
import { cloneDeep, first } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'

import {
  concatToOutput,
  processUnsupportedCommand,
  sendCliClusterCommandAction,
} from 'uiSrc/slices/cli/cli-output'
import { BrowserStorageItem } from 'uiSrc/constants'
import { InitOutputText } from 'uiSrc/constants/cliOutput'
import { processCliClient } from 'uiSrc/slices/cli/cli-settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sessionStorageService } from 'uiSrc/services'

import CliBodyWrapper from './CliBodyWrapper'

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

jest.mock('uiSrc/slices/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
  }),
}))

jest.mock('uiSrc/slices/cli/cli-output', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-output'),
  sendCliClusterCommandAction: jest.fn(),
  processUnsupportedCommand: jest.fn(),
  updateCliCommandHistory: jest.fn,
}))

jest.mock('uiSrc/utils/cliHelper', () => ({
  ...jest.requireActual('uiSrc/utils/cliHelper'),
  updateCliHistoryStorage: jest.fn(),
  clearOutput: jest.fn(),
  cliParseTextResponse: jest.fn(),
  cliParseTextResponseWithOffset: jest.fn(),
}))

const unsupportedCommands = ['sync', 'subscription']
const cliCommandTestId = 'cli-command'

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliSettingsSelector: jest.fn().mockReturnValue({
    unsupportedCommands,
    matchedCommand: 'get',
    isEnteringCommand: true,
    isShowHelper: true,
  }),
}))

describe('CliBodyWrapper', () => {
  it('should render', () => {
    expect(render(<CliBodyWrapper />)).toBeTruthy()
  })

  it('should SessionStorage be called', () => {
    const mockUuid = 'test-uuid'
    sessionStorageService.get = jest.fn().mockReturnValue(mockUuid)

    render(<CliBodyWrapper />)

    expect(sessionStorageService.get).toBeCalledWith(BrowserStorageItem.cliClientUuid)
  })

  it('should render with SessionStorage', () => {
    render(<CliBodyWrapper />)

    const expectedActions = [concatToOutput(InitOutputText('', 0)), processCliClient()]
    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('"onSubmit" should be called after keyDown Enter', () => {
    render(<CliBodyWrapper />)

    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    const expectedActions = [concatToOutput(InitOutputText('', 0)), processCliClient()]

    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('CliHelper should be opened by default', () => {
    render(<CliBodyWrapper />)

    expect(screen.getByTestId('cli-helper')).toBeInTheDocument()
  })

  // It's not possible to simulate events on contenteditable with testing-react-library,
  // or any testing library that uses js - dom, because of a limitation on js - dom itself.
  // https://github.com/testing-library/dom-testing-library/pull/235
  it.skip('"onSubmit" should check unsupported commands', () => {
    const processUnsupportedCommandMock = jest.fn()

    processUnsupportedCommand.mockImplementation(() => processUnsupportedCommandMock)

    render(<CliBodyWrapper />)

    // Act
    fireEvent.change(screen.getByTestId(cliCommandTestId), {
      target: { value: first(unsupportedCommands) },
    })

    // Act
    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    expect(processUnsupportedCommandMock).toBeCalled()
  })

  it('"onSubmit" for Cluster connection should call "sendCliClusterCommandAction"', () => {
    connectedInstanceSelector.mockImplementation(() => ({
      id: '123',
      connectionType: 'CLUSTER',
    }))

    const sendCliClusterActionMock = jest.fn()

    sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock)

    render(<CliBodyWrapper />)

    // Act
    fireEvent.keyDown(screen.getByTestId(cliCommandTestId), {
      key: 'Enter',
    })

    expect(sendCliClusterActionMock).toBeCalled()
  })
})
