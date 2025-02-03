import React from 'react'
import reactRouterDom from 'react-router-dom'
import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import { deleteChangedFile, getPipelineStrategies, rdiPipelineSelector, setChangedFile } from 'uiSrc/slices/rdi/pipeline'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { sendPageViewTelemetry, TelemetryPageView, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { MOCK_RDI_PIPELINE_CONFIG, MOCK_RDI_PIPELINE_DATA, MOCK_RDI_PIPELINE_JOB2 } from 'uiSrc/mocks/data/rdi'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import JobWrapper from './JobWrapper'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    schema: { jobs: { test: {} } },
  }),
}))

jest.mock('formik')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('JobWrapper', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<JobWrapper />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn();
    (sendPageViewTelemetry as jest.Mock).mockImplementation(() => sendPageViewTelemetryMock)

    render(<JobWrapper />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_JOBS,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
      }
    })
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<JobWrapper />)

    expect(screen.getByTestId('rdi-job-loading')).toBeInTheDocument()
  })

  it('should push to config page', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock })

    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: { config: MOCK_RDI_PIPELINE_CONFIG, jobs: [MOCK_RDI_PIPELINE_JOB2] },
    };
    (useFormikContext as jest.Mock).mockReturnValueOnce(mockUseFormikContext)

    render(<JobWrapper />)

    expect(pushMock).toBeCalledWith('/integrate/rdiInstanceId/pipeline-management/config')
  })

  it('should not push to config page', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      error: '',
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock })

    render(<JobWrapper />)

    expect(pushMock).not.toBeCalled()
  })

  it('should render proper link', () => {
    render(<JobWrapper />)

    expect(screen.getByTestId('rdi-pipeline-transformation-link')).toHaveAttribute('href', 'https://redis.io/docs/latest/integrate/redis-data-integration/ingest/data-pipelines/transform-examples/?utm_source=redisinsight&utm_medium=rdi&utm_campaign=job_file')
  })

  it('should send telemetry event with proper data', () => {
    render(<JobWrapper />)

    fireEvent.click(screen.getByTestId('rdi-job-dry-run'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_TEST_JOB_OPENED,
      eventData: {
        id: 'rdiInstanceId',
      }
    })
  })

  it('should render Panel and disable dry run btn', () => {
    const { queryByTestId } = render(<JobWrapper />)

    expect(screen.getByTestId('rdi-job-dry-run')).not.toBeDisabled()
    expect(queryByTestId('dry-run-panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('rdi-job-dry-run'))

    expect(screen.getByTestId('rdi-job-dry-run')).toBeDisabled()
    expect(queryByTestId('dry-run-panel')).toBeInTheDocument()
  })

  it('should call proper actions when change monaco editor', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      data: { jobs: [{ name: 'jobName', value: 'value' }] }
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<JobWrapper />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      getPipelineStrategies(),
      setChangedFile({ name: 'jobName', status: FileChangeType.Modified })
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions when value is equal with deployed job', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      data: { jobs: [{ name: 'jobName', value: '123' }] }
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<JobWrapper />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      getPipelineStrategies(),
      deleteChangedFile('jobName')
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render error notification', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      data: { jobs: [{ name: 'jobName', value: 'sources:incorrect\n target:' }] }
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: { config: MOCK_RDI_PIPELINE_CONFIG, jobs: [{ name: 'jobName', value: 'sources:incorrect\n target:' }] },
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)

    const { queryByTestId } = render(<JobWrapper />)

    fireEvent.click(screen.getByTestId('rdi-job-dry-run'))

    const expectedActions = [
      addErrorNotification({
        response: {
          data: {
            message: (
              <>
                JobName has an invalid structure.
                <br />
                end of the stream or a document separator is expected
              </>
            )
          }
        }
      } as AxiosError)
    ]

    expect(store.getActions().slice(0 - expectedActions.length)).toEqual(expectedActions)

    expect(queryByTestId('dry-run-panel')).not.toBeInTheDocument()
  })
})
