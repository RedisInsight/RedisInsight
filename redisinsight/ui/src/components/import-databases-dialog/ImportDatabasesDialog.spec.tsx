import { cloneDeep } from 'lodash'
import React from 'react'
import { importInstancesFromFile, importInstancesSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { render, screen, fireEvent, mockedStore, cleanup, act } from 'uiSrc/utils/test-utils'

import ImportDatabasesDialog from './ImportDatabasesDialog'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  importInstancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null
  })
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

describe('ImportDatabasesDialog', () => {
  it('should render', () => {
    expect(render(<ImportDatabasesDialog onClose={jest.fn()} />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const onClose = jest.fn()
    render(<ImportDatabasesDialog onClose={onClose} />)

    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(onClose).toBeCalled()
  })

  it('submit btn should be disabled without file', () => {
    render(<ImportDatabasesDialog onClose={jest.fn()} />)

    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })

  it('should call proper actions and send telemetry', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<ImportDatabasesDialog onClose={jest.fn()} />)

    const jsonString = JSON.stringify({})
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })

    await act(() => {
      fireEvent.change(
        screen.getByTestId('import-file-modal-filepicker'),
        {
          target: { files: [file] },
        }
      )
    })

    expect(screen.getByTestId('submit-btn')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('submit-btn'))

    const expectedActions = [importInstancesFromFile()]
    expect(store.getActions()).toEqual(expectedActions)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render loading indicator', () => {
    (importInstancesSelector as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: null
    }))

    render(<ImportDatabasesDialog onClose={jest.fn()} />)
    expect(screen.getByTestId('file-loading-indicator')).toBeInTheDocument()
  })

  it('should not render error message without error', () => {
    (importInstancesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: {}
    }))

    render(<ImportDatabasesDialog onClose={jest.fn()} />)
    expect(screen.queryByTestId('result-failed')).not.toBeInTheDocument()
  })

  it('should render error message when 0 success databases added', () => {
    (importInstancesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: null,
      error: 'Error message'
    }))

    render(<ImportDatabasesDialog onClose={jest.fn()} />)
    expect(screen.getByTestId('result-failed')).toBeInTheDocument()
    expect(screen.getByTestId('result-failed')).toHaveTextContent('Error message')
  })
})
