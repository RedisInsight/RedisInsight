import React from 'react'
import { cloneDeep } from 'lodash'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { getPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RefreshPipelinePopover from './RefreshPipelinePopover'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {
      jobs: [{ name: 'job1', value: 'value' }]
    }
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

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('RefreshPipelinePopover', () => {
  it('should render', () => {
    expect(render(<RefreshPipelinePopover />)).toBeTruthy()
  })

  it('should open confirmation message', async () => {
    render(<RefreshPipelinePopover />)

    expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId('refresh-pipeline-btn'))
    })

    expect(screen.queryByTestId('confirm-btn')).toBeInTheDocument()
  })

  it('should call proper actions', async () => {
    render(<RefreshPipelinePopover />)

    await act(() => {
      fireEvent.click(screen.getByTestId('refresh-pipeline-btn'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    const expectedActions = [getPipeline()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry event', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<RefreshPipelinePopover />)

    await act(() => {
      fireEvent.click(screen.getByTestId('refresh-pipeline-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_REFRESH_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 1
      }
    })
  })

  it('should render disabled trigger btn', () => {
    (rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true
    }))

    render(<RefreshPipelinePopover />)

    expect(screen.getByTestId('refresh-pipeline-btn')).toBeDisabled()
  })
})
