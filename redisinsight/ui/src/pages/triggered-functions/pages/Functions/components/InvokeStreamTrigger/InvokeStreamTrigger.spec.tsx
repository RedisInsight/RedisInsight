import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, clearStoreActions, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import {
  changeSearchMode,
  loadKeys,
  resetKeyInfo,
  resetKeysData,
  setFilter,
  setSearchMatch
} from 'uiSrc/slices/browser/keys'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { resetBrowserTree, setBrowserSelectedKey, setBrowserTreeDelimiter } from 'uiSrc/slices/app/context'
import { DEFAULT_DELIMITER, KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import InvokeStreamTrigger from './InvokeStreamTrigger'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('InvokeStreamTrigger', () => {
  it('should render', () => {
    expect(render(<InvokeStreamTrigger onCancel={jest.fn} />)).toBeTruthy()
  })

  it('should call onCancel', () => {
    const onCancel = jest.fn()

    render(<InvokeStreamTrigger onCancel={onCancel} />)

    fireEvent.click(screen.getByTestId('cancel-invoke-btn'))

    expect(onCancel).toBeCalled()
  })

  it('should call proper actions on submit', () => {
    render(<InvokeStreamTrigger onCancel={jest.fn()} />)

    fireEvent.change(
      screen.getByTestId('keyName-field'),
      { target: { value: 'key*' } }
    )
    fireEvent.click(screen.getByTestId('find-key-btn'))

    const expectedActions = [
      changeSearchMode(SearchMode.Pattern),
      setBrowserTreeDelimiter(DEFAULT_DELIMITER),
      setFilter(KeyTypes.Stream),
      setSearchMatch('key*', SearchMode.Pattern),
      resetKeysData(SearchMode.Pattern),
      resetBrowserTree(),
      resetKeyInfo(),
      setBrowserSelectedKey(null),
      loadKeys(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions([...expectedActions]))
  })

  it('should call push history on submit', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    render(<InvokeStreamTrigger onCancel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('find-key-btn'))
    expect(pushMock).toHaveBeenCalledWith('/instanceId/browser')
  })

  it('should call proper telemetry on submit', () => {
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<InvokeStreamTrigger onCancel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('find-key-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FIND_KEY_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      }
    })
  })
})
