import { cloneDeep } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'
import { useFormikContext } from 'formik'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import RdiPipelineHeader from './RdiPipelineHeader'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name',
  }),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

jest.mock('formik')

const mockHandleSubmit = jest.fn()

describe('InstanceHeader', () => {
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

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<RdiPipelineHeader />)

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/integrate')
  })

  it('should render proper instance name', () => {
    expect(render(<RdiPipelineHeader />)).toBeTruthy()

    expect(screen.getByTestId('rdi-instance-name')).toHaveTextContent('name')
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
