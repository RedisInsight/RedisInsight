import React from 'react'
import { loadAsync } from 'jszip'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import UploadModal from './UploadModal'

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
    },
    resetForm: jest.fn(),
    setFieldValue: jest.fn()
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

jest.mock('jszip', () => ({
  ...jest.requireActual('jszip'),
  loadAsync: jest.fn().mockReturnValue({
    file: jest.fn().mockReturnValue({
      async: jest.fn().mockReturnValue('config')
    }),
    files: {
      'jobs/': {
        async: jest.fn()
      },
      'jobs/job1.yaml': {
        async: jest.fn().mockReturnValue('value1')
      },
      'jobs/job2.yaml': {
        async: jest.fn().mockReturnValue('value2')
      }
    }
  })
}))

const button = (
  <button type="button" data-testid="btn">
    test
  </button>
)

describe('UploadModal', () => {
  it('should render', () => {
    expect(render(<UploadModal>{button}</UploadModal>)).toBeTruthy()
  })

  it('should call proper telemetry event when button is clicked', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<UploadModal>{button}</UploadModal>)

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_CLICKED,
      eventData: {
        id: 'rdiInstanceId'
      }
    })
  })

  it('should call proper telemetry event when file upload is successful', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<UploadModal>{button}</UploadModal>)

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] }
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_SUCCEEDED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 2
      }
    })
  })

  it('should call proper telemetry event when file upload has failed', async () => {
    (loadAsync as jest.Mock).mockImplementation(() => {
      throw new Error('error')
    })

    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<UploadModal>{button}</UploadModal>)

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] }
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FAILED,
      eventData: {
        id: 'rdiInstanceId',
        errorMessage: 'error'
      }
    })
  })

  it('should render disabled upload button when loading', () => {
    (rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true
    }))

    render(<UploadModal>{button}</UploadModal>)

    expect(screen.getByTestId('btn')).toBeDisabled()
  })

  it('should open modal when upload button is clicked', async () => {
    render(<UploadModal>{button}</UploadModal>)

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    waitFor(() => {
      expect(screen.getByTestId('import-file-modal')).toBeInTheDocument()
    })
  })
})
