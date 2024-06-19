import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import RdiPipelineHeader from './RdiPipelineHeader'

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

const mockHandleSubmit = jest.fn()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('RdiPipelineHeader', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      handleSubmit: mockHandleSubmit,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<RdiPipelineHeader />)).toBeTruthy()
  })

  it('should call proper telemetry on Deploy', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<RdiPipelineHeader />)

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_DEPLOY_CLICKED,
      eventData:
        {
          id: 'rdiInstanceId',
          jobsNumber: 2,
        }
    })
  })

  it('should open confirmation popover', () => {
    render(<RdiPipelineHeader />)

    expect(screen.queryByTestId('deploy-confirm-btn')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

    expect(screen.queryByTestId('deploy-confirm-btn')).toBeInTheDocument()
  })

  it('should call onSubmit and close popover', () => {
    render(<RdiPipelineHeader />)

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))
    fireEvent.click(screen.getByTestId('deploy-confirm-btn'))

    expect(mockHandleSubmit).toBeCalled()
  })
})
