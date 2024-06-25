import React from 'react'
import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import { EuiText } from '@elastic/eui'
import { AxiosError } from 'axios'
import { rdiPipelineSelector, setChangedFile, deleteChangedFile } from 'uiSrc/slices/rdi/pipeline'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import Config from './Config'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    schema: { config: { test: {} } },
    data: null,
  }),
}))

jest.mock('uiSrc/slices/rdi/testConnections', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/testConnections'),
  rdiTestConnectionsSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('formik')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Config', () => {
  const mockSetFieldValue = jest.fn()
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: mockSetFieldValue,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<Config />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn();
    (sendPageViewTelemetry as jest.Mock).mockImplementation(() => sendPageViewTelemetryMock)

    render(<Config />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_CONFIG,
    })
  })

  it('should call setFieldValue with proper values', () => {
    render(<Config />)
    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    expect(mockSetFieldValue).toBeCalledWith('config', '123')
  })

  it('should call proper actions', () => {
    render(<Config />)
    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      setChangedFile({ name: 'config', status: FileChangeType.Added })
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions when value equal to deployed pipeline', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { config: { test: {} } },
      data: { config: '123' },
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      deleteChangedFile('config')
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions when value not equal to deployed pipeline', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { config: { test: {} } },
      data: { config: '11' },
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    const fieldName = screen.getByTestId('rdi-monaco-config')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      setChangedFile({ name: 'config', status: FileChangeType.Modified })
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should open right panel', async () => {
    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(queryByTestId('test-connection-panel')).toBeInTheDocument()
  })

  it('should close right panel', async () => {
    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(queryByTestId('test-connection-panel')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('close-test-connections-btn'))
    })

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()
  })

  it('should render error notification', async () => {
    const mockUseFormikContext = {
      setFieldValue: mockSetFieldValue,
      values: { config: 'sources:incorrect\n target:' },
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)

    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    const expectedActions = [
      addErrorNotification({
        response: {
          data: {
            message: (
              <>
                <EuiText>Config has an invalid structure.</EuiText>
                <EuiText>end of the stream or a document separator is expected</EuiText>
              </>
            )
          }
        }
      } as AxiosError)
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    expect(screen.getByTestId('rdi-config-loading')).toBeInTheDocument()
  })

  it('should render loader on btn', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    // check is btn has loader
    expect(screen.getByTestId('rdi-test-connection-btn').children[0].children[0]).toHaveClass('euiLoadingSpinner')
  })

  it('should render loader on btn', () => {
    const rdiTestConnectionsSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiTestConnectionsSelector as jest.Mock).mockImplementation(rdiTestConnectionsSelectorMock)

    render(<Config />)

    // check is btn has loader
    expect(screen.getByTestId('rdi-test-connection-btn').children[0].children[0]).toHaveClass('euiLoadingSpinner')
  })
})
