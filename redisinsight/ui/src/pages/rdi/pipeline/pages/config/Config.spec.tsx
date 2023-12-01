import React from 'react'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { render, screen } from 'uiSrc/utils/test-utils'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import Config from './Config'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
  }),
}))

describe('Config', () => {
  it('should render', () => {
    expect(render(<Config />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn()
    sendPageViewTelemetry.mockImplementation(() => sendPageViewTelemetryMock)

    render(<Config />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_CONFIG,
    })
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    })
    rdiPipelineSelector.mockImplementation(rdiPipelineSelectorMock)

    render(<Config />)

    expect(screen.getByTestId('rdi-config-loading')).toBeInTheDocument()
  })
})
