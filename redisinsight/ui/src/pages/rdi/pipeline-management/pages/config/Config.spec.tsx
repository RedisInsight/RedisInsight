import React from 'react'
import { useFormikContext } from 'formik'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'
import { fireEvent, cleanup, render, screen, act } from 'uiSrc/utils/test-utils'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
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
  }),
}))

jest.mock('uiSrc/slices/rdi/testConnections', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/testConnections'),
  rdiTestConnectionsSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('formik')

beforeEach(() => {
  cleanup()
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

  it('should open right panel', async () => {
    const { queryByTestId } = render(<Config />)

    expect(queryByTestId('test-connection-panel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('rdi-test-connection-btn'))
    })

    expect(queryByTestId('test-connection-panel')).toBeInTheDocument()
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
