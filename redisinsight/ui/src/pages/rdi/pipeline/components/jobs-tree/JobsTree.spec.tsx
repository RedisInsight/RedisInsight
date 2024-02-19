import { useFormikContext } from 'formik'
import React from 'react'
import { instance, mock } from 'ts-mockito'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import JobsTree, { IProps } from './JobsTree'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    error: ''
  })
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      jobs: [
        { name: 'job1', value: 'value' }
      ]
    },
    setFieldValue: jest.fn()
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn()
}))

describe('JobsTree', () => {
  it('should render', () => {
    expect(render(<JobsTree {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render loader', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
      error: ''
    });
    (rdiPipelineSelector as jest.Mock).mockImplementationOnce(rdiPipelineSelectorMock)

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-jobs-loader')).toBeInTheDocument()
  })

  it('should render proper count of jobs', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('1')
  })

  it('should not render count of jobs if it is "0"', () => {
    const useFormikContextMock = jest.fn().mockReturnValue({
      values: { jobs: [] }
    });
    (useFormikContext as jest.Mock).mockImplementationOnce(useFormikContextMock)

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('')
  })

  it('should call selected tab', () => {
    const mockOnSelectedTab = jest.fn()

    render(<JobsTree {...instance(mockedProps)} onSelectedTab={mockOnSelectedTab} />)

    fireEvent.click(screen.getByTestId('rdi-nav-job-job1'))
    expect(mockOnSelectedTab).toBeCalledWith('job1')
  })

  it('should render job name', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toHaveTextContent('job1')
  })

  it('should render job name with proper class', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toHaveClass('truncateText')
  })

  it('should render actions', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-actions-job1')).toBeInTheDocument()
  })

  it('should delete job', async () => {
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    waitFor(() => {
      expect(screen.queryByTestId('delete-job-job1')).not.toBeInTheDocument()
    })
  })

  it('should not delete job', async () => {
    render(<JobsTree {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(document)
    })

    waitFor(() => {
      expect(screen.queryByTestId('delete-job-job1')).toBeInTheDocument()
    })
  })

  it('should edit job name', async () => {
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    waitFor(() => {
      expect(screen.getByTestId('rdi-nav-job-edit-job1')).toBeInTheDocument()
    })
  })

  it('should not edit job name', async () => {
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    await act(() => {
      fireEvent.click(document)
    })

    waitFor(() => {
      expect(screen.queryByTestId('rdi-nav-job-edit-job1')).not.toBeInTheDocument()
    })
  })

  it('should call proper telemetry event when adding new job', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} rdiInstanceId="id" />)

    await act(() => {
      fireEvent.click(screen.getByTestId('add-new-job'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('job-name-input-0'), { target: { value: 'job3' } })
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_CREATED,
      eventData: {
        rdiInstanceId: 'id',
        jobName: 'job3',
      }
    })
  })

  it('should call proper telemetry event when deleting job', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} rdiInstanceId="id" />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_DELETED,
      eventData: {
        rdiInstanceId: 'id',
        jobName: 'job1',
      }
    })
  })

  it('should push to config tab when deleting last job', async () => {
    const mockOnSelectedTab = jest.fn()

    render(<JobsTree {...instance(mockedProps)} onSelectedTab={mockOnSelectedTab} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    expect(mockOnSelectedTab).toBeCalledWith('config')
  })
})
