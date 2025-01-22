import React from 'react'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import Download from './Download'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    config: 'value',
    jobs: [
      { name: 'job1', value: 'value' },
      { name: 'job2', value: 'value' }
    ]
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

describe('Download', () => {
  it('should render', () => {
    expect(render(<Download />)).toBeTruthy()
  })

  it('should call onClose when download clicked', async () => {
    const onClose = jest.fn()
    render(<Download onClose={onClose} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('download-pipeline-btn'))
    })

    expect(onClose).toBeCalledTimes(1)
  })

  it('should call proper telemetry event when button is clicked', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<Download />)

    await act(() => {
      fireEvent.click(screen.getByTestId('download-pipeline-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 2
      }
    })
  })

  it('should render disabled download button when loading', () => {
    (rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true
    }))

    render(<Download />)

    expect(screen.getByTestId('download-pipeline-btn')).toBeDisabled()
  })
})
