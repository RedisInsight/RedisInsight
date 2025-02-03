import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  getPipelineStrategies,
  rdiPipelineSelector,
  setChangedFile,
  deleteChangedFile,
  setPipelineJobs,
} from 'uiSrc/slices/rdi/pipeline'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { FileChangeType } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Job, { Props } from './Job'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    schema: { jobs: { test: {} } },
    config: `connections:
            target:
              type: redis
          `,
    jobs: [{
      name: 'jobName',
      value: `job:
      transform:
        type: sql
    `
    }, {
      name: 'job2',
      value: `job2:
      transform:
        type: redis
    `
    }],
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Job', () => {
  it('should render', () => {
    expect(render(<Job {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not push to config page', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      error: '',
      config: `connections:
      target:
        type: redis
    `,
      jobs: [{
        name: 'jobName',
        value: `job:
                    transform:
                      type: sql
                `
      }, {
        name: 'job2',
        value: `job2:
                    transform:
                      type: redis
                    `
      }],
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock })

    render(<Job {...instance(mockedProps)} />)

    expect(pushMock).not.toBeCalled()
  })

  it('should render Panel and disable dry run btn', () => {
    const { queryByTestId } = render(<Job {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-job-dry-run')).not.toBeDisabled()
    expect(queryByTestId('dry-run-panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('rdi-job-dry-run'))

    expect(screen.getByTestId('rdi-job-dry-run')).toBeDisabled()
    expect(queryByTestId('dry-run-panel')).toBeInTheDocument()
  })

  it('should not call any updated file action if there is no deployed job', () => {
    render(<Job {...instance(mockedProps)} name="jobName" />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      getPipelineStrategies(),
      setPipelineJobs(expect.any(Array)),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should set modified file', () => {
    render(<Job {...instance(mockedProps)} deployedJobValue="value" name="jobName" />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    const expectedActions = [
      getPipelineStrategies(),
      setPipelineJobs(expect.any(Array)),
      setChangedFile({ name: 'jobName', status: FileChangeType.Modified }),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should remove job from modified files', () => {
    render(<Job {...instance(mockedProps)} deployedJobValue="value" name="jobName" />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: 'value' } }
    )

    const expectedActions = [
      getPipelineStrategies(),
      setPipelineJobs(expect.any(Array)),
      deleteChangedFile('jobName')
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should open dedicated editor', () => {
    render(<Job {...instance(mockedProps)} deployedJobValue="value" name="jobName" />)

    expect(screen.queryByTestId('draggable-area')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('open-dedicated-editor-btn'))

    expect(screen.getByTestId('draggable-area')).toBeInTheDocument()
  })

  it('should call proper telemetry events on open dedicated editor', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<Job {...instance(mockedProps)} value="value" rdiInstanceId="id" />)

    fireEvent.click(screen.getByTestId('open-dedicated-editor-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_OPENED,
      eventData: {
        rdiInstanceId: 'id'
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on cancel dedicated editor', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<Job {...instance(mockedProps)} value="value" rdiInstanceId="id" />)

    fireEvent.click(screen.getByTestId('open-dedicated-editor-btn'))
    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_CANCELLED,
      eventData: {
        rdiInstanceId: 'id',
        selectedLanguageSyntax: 'sqliteFunctions',
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on submit dedicated editor', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<Job {...instance(mockedProps)} value="value" rdiInstanceId="id" />)

    fireEvent.click(screen.getByTestId('open-dedicated-editor-btn'))
    await act(() => {
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_DEDICATED_EDITOR_SAVED,
      eventData: {
        rdiInstanceId: 'id',
        selectedLanguageSyntax: 'sqliteFunctions',
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Job {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-job-loading')).toBeInTheDocument()
  })
})
