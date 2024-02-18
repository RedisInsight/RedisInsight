import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { dryRunJob } from 'uiSrc/slices/rdi/dryRun'
import JobsPanel, { Props } from './Panel'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('JobsPanel', () => {
  it('should render', () => {
    expect(render(<JobsPanel {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call onClose', () => {
    const mockOnClose = jest.fn()
    render(<JobsPanel {...instance(mockedProps)} onClose={mockOnClose} />)

    fireEvent.click(screen.getByTestId('close-dry-run-btn'))
    expect(mockOnClose).toBeCalled()
  })

  it('should render run btn with proper properties', () => {
    render(<JobsPanel {...instance(mockedProps)} />)

    expect(screen.getByTestId('dry-run-btn')).toBeDisabled()

    // set invalid json value
    fireEvent.change(screen.getByTestId('input-value'), { target: { value: 'test' } })

    expect(screen.getByTestId('dry-run-btn')).toBeDisabled()

    // set valid json value
    fireEvent.change(screen.getByTestId('input-value'), { target: { value: 1 } })

    expect(screen.getByTestId('dry-run-btn')).not.toBeDisabled()
  })

  it('should call proper telemetry events', () => {
    render(<JobsPanel {...instance(mockedProps)} />)

    fireEvent.change(screen.getByTestId('input-value'), { target: { value: 1 } })
    fireEvent.click(screen.getByTestId('dry-run-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_TEST_JOB_RUN,
      eventData: {
        id: 'rdiInstanceId',
      }
    })
  })

  it('should render proper tab', () => {
    const { queryByTestId } = render(<JobsPanel {...instance(mockedProps)} />)

    expect(queryByTestId('transformations-output')).toBeInTheDocument()
    expect(queryByTestId('commands-output')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('output-tab'))

    expect(queryByTestId('transformations-output')).not.toBeInTheDocument()
    expect(queryByTestId('commands-output')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('transformations-tab'))

    expect(queryByTestId('transformations-output')).toBeInTheDocument()
    expect(queryByTestId('commands-output')).not.toBeInTheDocument()
  })

  it('should fetch dry run job results', () => {
    render(<JobsPanel {...instance(mockedProps)} />)

    fireEvent.change(screen.getByTestId('input-value'), { target: { value: 1 } })
    fireEvent.click(screen.getByTestId('dry-run-btn'))

    const expectedActions = [
      dryRunJob(),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })
})
