import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import DeployPipelineButton, { Props } from './DeployPipelineButton'

const mockedProps: Props = {
  loading: false,
  disabled: false,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    config: 'value',
    jobs: [{ name: 'job1', value: '1' }, { name: 'job2', value: '2' }]
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DeployPipelineButton', () => {
  it('should render', () => {
    expect(render(<DeployPipelineButton {...mockedProps} />)).toBeTruthy()
  })

  describe('TelemetryEvent', () => {
    beforeEach(() => {
      const sendEventTelemetryMock = jest.fn();
      (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

      render(<DeployPipelineButton {...mockedProps} />)
    })

    it('should call proper telemetry on Deploy', () => {
      fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))
      fireEvent.click(screen.getByTestId('deploy-confirm-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_DEPLOY_CLICKED,
        eventData:
          {
            id: 'rdiInstanceId',
            reset: false,
            jobsNumber: 2,
          }
      })
    })

    it('should reset true if reset checkbox is in the checked state telemetry on Deploy', () => {
      fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

      const el = screen.getByTestId('reset-pipeline-checkbox') as HTMLInputElement
      expect(el.checked).toBe(false)
      fireEvent.click(el)
      expect(el.checked).toBe(true)
      fireEvent.click(screen.getByTestId('deploy-confirm-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_DEPLOY_CLICKED,
        eventData:
          {
            id: 'rdiInstanceId',
            reset: false,
            jobsNumber: 2,
          }
      })
    })
  })

  it('should open confirmation popover', () => {
    render(<DeployPipelineButton {...mockedProps} />)

    expect(screen.queryByTestId('deploy-confirm-btn')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

    expect(screen.queryByTestId('deploy-confirm-btn')).toBeInTheDocument()
  })
})
