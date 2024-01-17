import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  getRecommendations,
  recommendationsSelector,
} from 'uiSrc/slices/recommendations/recommendations'
import { fireEvent, screen, cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { changeSelectedTab, insightsPanelSelector, resetExplorePanelSearch, setExplorePanelIsPageOpen, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import DatabaseSidePanels from './DatabaseSidePanels'

let store: typeof mockedStore

const mockRecommendationsSelector = {
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  content: MOCK_RECOMMENDATIONS,
}

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    insightsRecommendations: {
      flag: true
    }
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    connectionType: 'CLUSTER',
    provider: 'RE_CLOUD'
  }),
  connectedInstanceCDSelector: jest.fn().mockReturnValue({
    free: false,
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextCapability: jest.fn().mockReturnValue({
    source: 'workbench RediSearch',
  }),
}))

jest.mock('uiSrc/slices/recommendations/recommendations', () => ({
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  recommendationsSelector: jest.fn().mockReturnValue({
    data: {
      recommendations: [],
      totalUnread: 0,
    },
  })
}))

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: false,
    tabSelected: 'explore'
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getTutorialCapability: jest.fn().mockReturnValue({ path: 'path', telemetryName: 'searchAndQuery' }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  isShowCapabilityTutorialPopover: jest.fn(),
}))

/**
 * DatabaseSidePanels tests
 *
 * @group component
 */

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DatabaseSidePanels', () => {
  it('should render', () => {
    expect(render(<DatabaseSidePanels />)).toBeTruthy()
  })

  it('should call proper actions when recommendations tab is Open after render', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
    }));

    (insightsPanelSelector as jest.Mock).mockReturnValue({
      isOpen: true,
      tabSelected: 'tips'
    })

    render(<DatabaseSidePanels />)

    const expectedActions = [getRecommendations()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should not render recommendations count with totalUnread = 0', () => {
    (recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 0,
      },
    }))

    render(<DatabaseSidePanels />)

    expect(screen.queryByTestId('recommendations-unread-count')).not.toBeInTheDocument()
  })

  it('should render recommendations count with totalUnread > 0', () => {
    (insightsPanelSelector as jest.Mock).mockReturnValue({
      isOpen: true,
      tabSelected: 'tips'
    });

    (recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 7,
      },
    }))

    render(<DatabaseSidePanels />)
    expect(screen.getByTestId('recommendations-unread-count')).toHaveTextContent('7')
  })

  it('should call proper telemetry events on close panel', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.triggeredFunctionsLibraries('instanceId') });

    (insightsPanelSelector as jest.Mock).mockReturnValue({
      isOpen: true,
      tabSelected: 'tips'
    })

    render(<DatabaseSidePanels />)

    fireEvent.click(screen.getByTestId('close-insights-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'RE_CLOUD',
        page: '/triggered-functions/libraries',
        tab: 'tips'
      },
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on change tab', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.triggeredFunctionsLibraries('instanceId') });

    (insightsPanelSelector as jest.Mock).mockReturnValue({
      isOpen: true,
      tabSelected: 'tips'
    })

    render(<DatabaseSidePanels />)

    fireEvent.click(screen.getByTestId('explore-tab'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_TAB_CHANGED,
      eventData: {
        databaseId: 'instanceId',
        prevTab: 'tips',
        currentTab: 'explore',
      },
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on fullscreen', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);
    (insightsPanelSelector as jest.Mock).mockReturnValue({
      isOpen: true,
      tabSelected: 'recommendations'
    })

    render(<DatabaseSidePanels />)

    fireEvent.click(screen.getByTestId('fullScreen-insights-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_FULL_SCREEN_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        state: 'open'
      },
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  describe('capability', () => {
    beforeEach(() => {
      (connectedInstanceCDSelector as jest.Mock).mockReturnValueOnce({ free: true });
      (isShowCapabilityTutorialPopover as jest.Mock).mockImplementation(() => true)
    })
    it('should call store actions', () => {
      (getTutorialCapability as jest.Mock).mockImplementation(() => ({
        tutorialPage: { args: { path: 'path' } }
      }))
      render(<DatabaseSidePanels />)

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        toggleInsightsPanel(true),
      ]
      expect(store.getActions()).toEqual(expectedActions);

      (getTutorialCapability as jest.Mock).mockRestore()
    })
    it('should call resetExplorePanelSearch if capability was not found', () => {
      render(<DatabaseSidePanels />)

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        toggleInsightsPanel(true),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
