import React from 'react'
import reactRouterDom from 'react-router-dom'
import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  getPipelineStrategies,
  rdiPipelineSelector,
  setChangedFile,
  deleteChangedFile,
} from 'uiSrc/slices/rdi/pipeline'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { FileChangeType } from 'uiSrc/slices/interfaces'
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
  }),
}))

jest.mock('formik')

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Job', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<Job {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not push to config page', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      error: '',
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock })

    render(<Job {...instance(mockedProps)} />)

    expect(pushMock).not.toBeCalled()
  })

  it('should render proper link', () => {
    render(<Job {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-pipeline-transformation-link')).toHaveAttribute('href', 'https://docs.redis.com/latest/rdi/data-transformation/data-transformation-pipeline/')
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
      deleteChangedFile('jobName')
    ]

    expect(store.getActions()).toEqual(expectedActions)
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
