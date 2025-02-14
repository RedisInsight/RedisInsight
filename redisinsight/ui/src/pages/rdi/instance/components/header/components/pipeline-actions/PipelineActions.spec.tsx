import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { CollectorStatus, PipelineStatus } from 'uiSrc/slices/interfaces'
import { validatePipeline } from 'uiSrc/components/yaml-validator'
import {
  rdiPipelineSelector,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
} from 'uiSrc/slices/rdi/pipeline'
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

jest.mock('uiSrc/components/yaml-validator', () => ({
  validatePipeline: jest.fn(),
}))

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

  it('should validate pipeline when schema, config, or jobs change', () => {
    (validatePipeline as jest.Mock).mockReturnValue({
      result: true,
      configValidationErrors: [],
      jobsValidationErrors: {},
    });

    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      schema: 'test-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(validatePipeline).toHaveBeenCalledWith({
      schema: 'test-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    expect(store.getActions()).toEqual([
      setConfigValidationErrors([]),
      setJobsValidationErrors({}),
      setIsPipelineValid(true),
    ])
  })

  it('should set pipeline as invalid if config and jobs are empty (no configuration is entered)', () => {
    (validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Error'],
      jobsValidationErrors: [],
    });

    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      config: '',
      jobs: '',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )
  })

  it('should set pipeline as invalid if config and jobs are missing or empty (no configuration is entered)', () => {
    (validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Error'],
      jobsValidationErrors: [],
    });

    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      config: undefined,
      jobs: undefined,
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )
  })

  it('should dispatch validation errors if validation fails', () => {
    (validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Missing field'],
      jobsValidationErrors: ['Invalid job config'],
    });

    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      schema: 'test-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setConfigValidationErrors.type,
          payload: ['Missing field'],
        }),
        expect.objectContaining({
          type: setJobsValidationErrors.type,
          payload: ['Invalid job config'],
        }),
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )
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
})
