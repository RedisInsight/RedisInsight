import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { CollectorStatus, PipelineStatus } from 'uiSrc/slices/interfaces'
import PipelineActions, { Props } from './PipelineActions'

const mockedProps: Props = {
  collectorStatus: CollectorStatus.Ready,
  pipelineStatus: PipelineStatus.Ready,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('formik')

// const mockHandleSubmit = jest.fn()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PipelineActions', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      handleSubmit: jest.fn(),
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<PipelineActions {...mockedProps} />)).toBeTruthy()
  })

  it('should display stopBtn if collectorStatus is ready', () => {
    render(<PipelineActions {...mockedProps} collectorStatus={CollectorStatus.Ready} />)
    expect(screen.getByText('Stop Pipeline')).toBeInTheDocument()
  })

  it('should display startBtn if collectorStatus is not ready', () => {
    render(<PipelineActions {...mockedProps} collectorStatus={CollectorStatus.NotReady} />)
    expect(screen.getByText('Start Pipeline')).toBeInTheDocument()
  })

  it('should display startBtn if collectorStatus is not ready', () => {
    render(<PipelineActions {...mockedProps} collectorStatus={CollectorStatus.NotReady} />)
    expect(screen.getByText('Start Pipeline')).toBeInTheDocument()
  })

  describe('TelemetryEvent', () => {
    beforeEach(() => {
      const sendEventTelemetryMock = jest.fn();
      (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    })

    it('should call proper telemetry on reset btn click', () => {
      render(<PipelineActions {...mockedProps} />)
      fireEvent.click(screen.getByTestId('reset-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_RESET_CLICKED,
        eventData:
          {
            id: 'rdiInstanceId',
            pipelineStatus: mockedProps.pipelineStatus
          }
      })
    })

    it('should call proper telemetry on start btn click', () => {
      render(<PipelineActions {...mockedProps} collectorStatus={CollectorStatus.Stopped} />)
      fireEvent.click(screen.getByTestId('start-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_START_CLICKED,
        eventData:
          {
            id: 'rdiInstanceId',
          }
      })
    })

    it('should call proper telemetry on stop btn click', () => {
      render(<PipelineActions {...mockedProps} />)
      fireEvent.click(screen.getByTestId('stop-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_STOP_CLICKED,
        eventData:
          {
            id: 'rdiInstanceId',
          }
      })
    })
  })

  //   it('should call proper telemetry on Deploy', () => {
  //     fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))
  //     fireEvent.click(screen.getByTestId('deploy-confirm-btn'))
  //     expect(sendEventTelemetry).toBeCalledWith({
  //       event: TelemetryEvent.RDI_DEPLOY_CLICKED,
  //       eventData:
  //         {
  //           id: 'rdiInstanceId',
  //           reset: false,
  //           jobsNumber: 2,
  //         }
  //     })
  //   })

  //   it('should reset true if reset checkbox is in the checked state telemetry on Deploy', () => {
  //     fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

  //     const el = screen.getByTestId('reset-pipeline-checkbox') as HTMLInputElement
  //     expect(el.checked).toBe(false)
  //     fireEvent.click(el)
  //     expect(el.checked).toBe(true)
  //     fireEvent.click(screen.getByTestId('deploy-confirm-btn'))
  //     expect(sendEventTelemetry).toBeCalledWith({
  //       event: TelemetryEvent.RDI_DEPLOY_CLICKED,
  //       eventData:
  //         {
  //           id: 'rdiInstanceId',
  //           reset: false,
  //           jobsNumber: 2,
  //         }
  //     })
  //   })
  // })

  // it('should open confirmation popover', () => {
  //   render(<PipelineActions {...mockedProps} />)

  //   expect(screen.queryByTestId('deploy-confirm-btn')).not.toBeInTheDocument()

  //   fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

  //   expect(screen.queryByTestId('deploy-confirm-btn')).toBeInTheDocument()
  // })

  // it('should call onSubmit and close popover', () => {
  //   render(<PipelineActions {...mockedProps} />)

  //   fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))
  //   fireEvent.click(screen.getByTestId('deploy-confirm-btn'))

  //   expect(mockHandleSubmit).toBeCalled()
  // })
})
