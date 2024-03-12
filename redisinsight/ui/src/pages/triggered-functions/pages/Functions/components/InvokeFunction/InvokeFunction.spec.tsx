import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, act, fireEvent, mockedStore, cleanup, clearStoreActions } from 'uiSrc/utils/test-utils'

import { openCli } from 'uiSrc/slices/cli/cli-settings'
import { concatToOutput, sendCliCommand, updateCliCommandHistory } from 'uiSrc/slices/cli/cli-output'
import { cliCommandOutput } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import InvokeFunction, { Props } from './InvokeFunction'

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliSettingsSelector: jest.fn().mockReturnValue({
    cliClientUuid: '123'
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('InvokeFunction', () => {
  it('should render', () => {
    expect(render(<InvokeFunction {...mockedProps} />)).toBeTruthy()
  })

  it('should properly render form and preview on init', async () => {
    await act(() => {
      render(<InvokeFunction {...mockedProps} />)
    })

    expect(screen.getByTestId('keyname-field-0')).toBeInTheDocument()
    expect(screen.getByTestId('argument-field-0')).toBeInTheDocument()
    expect(screen.getByTestId('redis-command-preview')).toBeInTheDocument()
  })

  it('should properly change form, change preview and call proper actions on submit', async () => {
    const expectedCommand = 'TFCALL "lib.foo" "1" "keyName" "argument-1" "argument-2"'
    await act(() => {
      render(<InvokeFunction {...mockedProps} name="foo" libName="lib" isAsync={false} />)
    })

    fireEvent.change(
      screen.getByTestId('keyname-field-0'),
      { target: { value: 'keyName' } }
    )

    fireEvent.change(
      screen.getByTestId('argument-field-0'),
      { target: { value: 'argument-1' } }
    )

    fireEvent.click(screen.getByTestId('add-new-argument-item'))

    fireEvent.change(
      screen.getByTestId('argument-field-1'),
      { target: { value: 'argument-2' } }
    )

    expect(screen.getByTestId('redis-command-preview'))
      .toHaveTextContent(expectedCommand)

    fireEvent.click(screen.getByTestId('invoke-function-btn'))

    const expectedActions = [
      openCli(),
      concatToOutput(cliCommandOutput(expectedCommand, 0)),
      updateCliCommandHistory([expectedCommand]),
      sendCliCommand()
    ]

    expect(clearStoreActions(store.getActions())).toEqual(clearStoreActions([...expectedActions]))
  })

  it('should call onCancel', async () => {
    const onCancel = jest.fn()
    await act(() => {
      render(<InvokeFunction {...mockedProps} onCancel={onCancel} />)
    })

    fireEvent.click(screen.getByTestId('cancel-invoke-btn'))

    expect(onCancel).toBeCalled()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    await act(() => {
      render(<InvokeFunction {...mockedProps} />)
    })

    fireEvent.click(screen.getByTestId('invoke-function-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_FUNCTION_INVOKE_REQUESTED,
      eventData: {
        databaseId: 'instanceId',
      }
    })

    sendEventTelemetry.mockRestore()
  })
})
