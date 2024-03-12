import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import { findTutorialPath } from 'uiSrc/utils'

import CapabilityPromotion from './CapabilityPromotion'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  findTutorialPath: jest.fn(),
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

    MOCK_EXPLORE_GUIDES.forEach(({ tutorialId }) => {
      expect(screen.getByTestId(`capability-promotion-${tutorialId}`)).toBeInTheDocument()
    })
  })

  it('should call proper actions and history push on click capability', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock });
    (findTutorialPath as jest.Mock).mockImplementation(() => '0/1/0')

    const id = MOCK_EXPLORE_GUIDES[0]?.tutorialId
    render(<CapabilityPromotion />)

    fireEvent.click(screen.getByTestId(`capability-promotion-${id}`))

    const expectedActions = [
      changeSelectedTab(InsightsPanelTabs.Explore),
      toggleInsightsPanel(true)
    ]

    expect(store.getActions()).toEqual(expectedActions)
    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/0/1/0'
    })
  })

  it('should call proper telemetry after click capability', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const id = MOCK_EXPLORE_GUIDES[0]?.tutorialId
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
