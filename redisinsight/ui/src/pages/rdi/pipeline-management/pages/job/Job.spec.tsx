import React from 'react'
import reactRouterDom from 'react-router-dom'
import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
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

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Job {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-job-loading')).toBeInTheDocument()
  })

  it('should not push to config page', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
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

  it('should not call any actions when job is new', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: false,
      schema: { jobs: { test: {} } },
      data: { jobs: [] }
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Job {...instance(mockedProps)} />)

    const fieldName = screen.getByTestId('rdi-monaco-job')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )

    expect(store.getActions()).toEqual([])
  })
})
