import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import MoreInfoPopover from './MoreInfoPopover'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('MoreInfoPopover', () => {
  it('should render', () => {
    expect(render(<MoreInfoPopover metrics={[]} modules={[]} />)).toBeTruthy()
  })

  it('should render modules and metrics', () => {
    const metricsMock = [{
      id: '1',
      content: <></>,
      value: 'value',
      unavailableText: 'text',
      title: 'title',
      tooltip: {
        icon: null,
        content: 'content'
      }
    }]
    const modulesMock = [{ name: 'search' }]
    const { queryByTestId } = render(<MoreInfoPopover metrics={metricsMock} modules={modulesMock} />)

    fireEvent.click(queryByTestId('overview-more-info-button'))
    fireEvent.click(queryByTestId('free-database-link'))

    expect(queryByTestId('overview-more-info-tooltip')).toBeInTheDocument()
  })

  it('should call proper telemetry event after click on 3 dots', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<MoreInfoPopover metrics={[]} modules={[]} />)

    fireEvent.click(screen.getByTestId('overview-more-info-button'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.OVERVIEW_MENU_CLICKED,
      eventData: {
        databaseId: 'instanceId'
      }
    })

    sendEventTelemetry.mockRestore()
  })
})
