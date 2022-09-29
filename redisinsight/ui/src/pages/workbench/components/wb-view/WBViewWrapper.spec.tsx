import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'
import QueryWrapper, { Props as QueryProps } from 'uiSrc/components/query'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendWBCommandAction } from 'uiSrc/slices/workbench/wb-results'
import { getWBGuides } from 'uiSrc/slices/workbench/wb-guides'
import { getWBTutorials } from 'uiSrc/slices/workbench/wb-tutorials'

import WBViewWrapper from './WBViewWrapper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/components/query', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const QueryWrapperMock = (props: QueryProps) => (
  <div
    onKeyDown={(e: any) => props.onKeyDown(e, 'get')}
    data-testid="query"
    aria-label="query"
    role="textbox"
    tabIndex={0}
  />
)

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
  }),
}))

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: []
  }),
}))

jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-results'),
  sendWBCommandClusterAction: jest.fn(),
  processUnsupportedCommand: jest.fn(),
  updateCliCommandHistory: jest.fn,
}))

jest.mock('uiSrc/slices/workbench/wb-guides', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-guides').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-guides'),
    workbenchGuidesSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

jest.mock('uiSrc/slices/workbench/wb-tutorials', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-tutorials').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-tutorials'),
    workbenchTutorialsSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

/**
 * WBViewWrapper tests
 *
 * @group unit
 */
describe('WBViewWrapper', () => {
  beforeAll(() => {
    QueryWrapper.mockImplementation(QueryWrapperMock)
  })

  it('should render', () => {
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendWBCommandClusterActionMock = jest.fn();

    // sendWBCommandClusterAction.mockImplementation(() => sendWBCommandClusterActionMock);

    expect(render(<WBViewWrapper />)).toBeTruthy()
  })

  it('should render with SessionStorage', () => {
    render(<WBViewWrapper />)

    const expectedActions = [getWBGuides(), getWBTutorials()]
    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it.skip('"onSubmit" for Cluster connection should call "sendWBCommandClusterAction"', async () => {
    connectedInstanceSelector.mockImplementation(() => ({
      id: '123',
      connectionType: 'CLUSTER',
    }))

    const sendWBCommandClusterActionMock = jest.fn()

    sendWBCommandAction.mockImplementation(() => sendWBCommandClusterActionMock)

    const { queryAllByTestId } = render(<WBViewWrapper />)

    // Act
    await act(() => {
      fireEvent.click(queryAllByTestId(/preselect-/)[0])
    })

    const monacoEl = screen.getByTestId('query')

    fireEvent.keyDown(monacoEl, {
      code: 'Enter',
      ctrlKey: true,
    })

    expect(sendWBCommandClusterActionMock).toBeCalled()
  })
})
