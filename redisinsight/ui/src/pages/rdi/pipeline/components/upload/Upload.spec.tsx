import React from 'react'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import Upload from './Upload'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false
  })
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: 'value',
      jobs: [
        { name: 'job1', value: 'value' },
        { name: 'job2', value: 'value' }
      ]
    }
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

describe('Upload', () => {
  it('should render', () => {
    expect(render(<Upload />)).toBeTruthy()
  })

  it('should call proper telemetry event when button is clicked', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<Upload />)

    await act(() => {
      fireEvent.click(screen.getByTestId('upload-pipeline-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_CLICKED,
      eventData: {
        id: 'rdiInstanceId'
      }
    })
  })

  it('should render disabled upload button when loading', () => {
    (rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true
    }))

    render(<Upload />)

    expect(screen.getByTestId('upload-pipeline-btn')).toBeDisabled()
  })

  it('should open modal when upload button is clicked', async () => {
    render(<Upload />)

    await act(() => {
      fireEvent.click(screen.getByTestId('upload-pipeline-btn'))
    })

    waitFor(() => {
      expect(screen.getByTestId('import-file-modal')).toBeInTheDocument()
    })
  })
})
