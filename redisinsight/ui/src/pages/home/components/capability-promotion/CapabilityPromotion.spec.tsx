import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { capabilities } from './constants'

import CapabilityPromotion from './CapabilityPromotion'

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

describe('CapabilityPromotion', () => {
  it('should render', () => {
    expect(render(<CapabilityPromotion />)).toBeTruthy()
  })

  it('should render capabilities', () => {
    render(<CapabilityPromotion />)

    capabilities.forEach(({ id }) => {
      expect(screen.getByTestId(`capability-promotion-${id}`)).toBeInTheDocument()
    })
  })

  it('should call proper actions and history push on click capability', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const id = capabilities[0]?.id
    render(<CapabilityPromotion />)

    fireEvent.click(screen.getByTestId(`capability-promotion-${id}`))

    const expectedActions = [
      changeSelectedTab(InsightsPanelTabs.Explore),
      toggleInsightsPanel(true)
    ]

    expect(store.getActions()).toEqual(expectedActions)
    expect(pushMock).toBeCalledWith({
      search: `guidePath=${id}`
    })
  })

  it('should call proper telemetry after click capability', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const id = capabilities[0]?.id
    render(<CapabilityPromotion />)

    fireEvent.click(screen.getByTestId(`capability-promotion-${id}`))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: TELEMETRY_EMPTY_VALUE,
        source: 'home page',
        tutorialId: id
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
