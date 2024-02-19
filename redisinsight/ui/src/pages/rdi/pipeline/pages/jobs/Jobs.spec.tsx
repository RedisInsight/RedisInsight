import React from 'react'
import reactRouterDom from 'react-router-dom'
import { useFormikContext } from 'formik'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { sendPageViewTelemetry, TelemetryPageView, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { MOCK_RDI_PIPELINE_CONFIG, MOCK_RDI_PIPELINE_DATA, MOCK_RDI_PIPELINE_JOB2 } from 'uiSrc/mocks/data/rdi'
import Jobs from './Jobs'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
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

describe('Jobs', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<Jobs />)).toBeTruthy()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn();
    (sendPageViewTelemetry as jest.Mock).mockImplementation(() => sendPageViewTelemetryMock)

    render(<Jobs />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_JOBS,
    })
  })

  it('should render loading spinner', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiPipelineSelector as jest.Mock).mockImplementation(rdiPipelineSelectorMock)

    render(<Jobs />)

    expect(screen.getByTestId('rdi-jobs-loading')).toBeInTheDocument()
  })

  it('should render proper link', () => {
    render(<Jobs />)

    expect(screen.getByTestId('rdi-pipeline-transformation-link')).toHaveAttribute('href', 'https://docs.redis.com/latest/rdi/data-transformation/data-transformation-pipeline/')
  })

  it('should send telemetry event with proper data', () => {
    render(<Jobs />)

    fireEvent.click(screen.getByTestId('rdi-jobs-dry-run'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_TEST_JOB_OPENED,
      eventData: {
        id: 'rdiInstanceId',
      }
    })
  })

  it('should render Panel and disable dry run btn', () => {
    const { queryByTestId } = render(<Jobs />)

    expect(screen.getByTestId('rdi-jobs-dry-run')).not.toBeDisabled()
    expect(queryByTestId('dry-run-panel')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('rdi-jobs-dry-run'))

    expect(screen.getByTestId('rdi-jobs-dry-run')).toBeDisabled()
    expect(queryByTestId('dry-run-panel')).toBeInTheDocument()
  })
})
