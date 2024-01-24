import React from 'react'
import { useFormikContext } from 'formik'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { fireEvent, cleanup, render, screen } from 'uiSrc/utils/test-utils'

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
    const fieldName = screen.getByTestId('rdi-config')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    expect(mockSetFieldValue).toBeCalledWith('config', '123')
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    expect(screen.getByTestId('rdi-config-loading')).toBeInTheDocument()
  })
})
