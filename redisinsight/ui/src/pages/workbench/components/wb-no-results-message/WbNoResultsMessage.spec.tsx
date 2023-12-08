import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import WbNoResultsMessage from './WbNoResultsMessage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'RE_CLOUD'
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WbNoResultsMessage', () => {
  it('should render', () => {
    expect(render(<WbNoResultsMessage />)).toBeTruthy()
  })

  it('should call proper actions after click on insight btn', () => {
    render(<WbNoResultsMessage />)

    fireEvent.click(screen.getByTestId('no-results-explore-btn'))

    expect(store.getActions()).toEqual([
      changeSelectedTab(InsightsPanelTabs.Explore),
      toggleInsightsPanel(true)
    ])
  })

  it('should call proper telemetry events after click on insights', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<WbNoResultsMessage />)

    fireEvent.click(screen.getByTestId('no-results-explore-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'RE_CLOUD',
        source: 'workbench',
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
