import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { recommendationsSelector, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { removeFeatureFromHighlighting } from 'uiSrc/slices/app/features'
import InsightsTrigger from './InsightsTrigger'

let store: typeof mockedStore

jest.mock('uiSrc/slices/recommendations/recommendations', () => ({
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  recommendationsSelector: jest.fn().mockReturnValue({
    isHighlighted: false
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    connectionType: 'CLUSTER',
    provider: 'RE_CLOUD'
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('InsightsTrigger', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render', () => {
    expect(render(<InsightsTrigger />)).toBeTruthy()
  })

  it('should call proper actions after click on the button', () => {
    render(<InsightsTrigger />)

    fireEvent.click(screen.getByTestId('insights-trigger'))

    expect(store.getActions()).toEqual([toggleInsightsPanel(), removeFeatureFromHighlighting('insights')])
  })

  it('should call proper actions after click on the button when there are any recommendations', () => {
    (recommendationsSelector as jest.Mock).mockReturnValue({
      isHighlighted: true
    })
    render(<InsightsTrigger />)

    fireEvent.click(screen.getByTestId('insights-trigger'))

    expect(store.getActions()).toEqual([
      resetRecommendationsHighlighting(),
      changeSelectedTab(InsightsPanelTabs.Recommendations),
      toggleInsightsPanel(),
      removeFeatureFromHighlighting('insights')
    ])
  })

  it('should send proper telemetry', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.browser('instanceId') });

    (recommendationsSelector as jest.Mock).mockReturnValue({
      isHighlighted: true
    })
    render(<InsightsTrigger />)

    fireEvent.click(screen.getByTestId('insights-trigger'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'RE_CLOUD',
        source: 'overview',
        page: '/browser',
        tab: 'tips'
      },
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
