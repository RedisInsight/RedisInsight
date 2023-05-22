import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  getRecommendations,
  recommendationsSelector,
  setIsContentVisible
} from 'uiSrc/slices/recommendations/recommendations'
import { fireEvent, screen, cleanup, mockedStore, render, act, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { RECOMMENDATIONS_DATA_MOCK } from 'uiSrc/mocks/handlers/recommendations/recommendationsHandler'
import { appContextDbConfig, setRecommendationsShowHidden } from 'uiSrc/slices/app/context'
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import LiveTimeRecommendations from './LiveTimeRecommendations'

const recommendationsContent = _content as IRecommendationsStatic

let store: typeof mockedStore

const mockRecommendationsSelector = jest.requireActual('uiSrc/slices/recommendations/recommendations')
const mockAppContextDbConfigSelector = jest.requireActual('uiSrc/slices/app/context')

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    connectionType: 'CLUSTER',
    provider: 'RE_CLOUD'
  }),
}))

jest.mock('uiSrc/slices/recommendations/recommendations', () => ({
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  recommendationsSelector: jest.fn().mockReturnValue({
    data: {
      recommendations: [],
      totalUnread: 0,
    },
    isContentVisible: false,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextDbConfig: jest.fn().mockReturnValue({
    showHiddenRecommendations: false,
  }),
}))

/**
 * LiveTimeRecommendations tests
 *
 * @group component
 */

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('LiveTimeRecommendations', () => {
  it('should render', () => {
    expect(render(<LiveTimeRecommendations />)).toBeTruthy()
  })

  it('should render beta label and github icon', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS' }] },
      isContentVisible: true
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.getByTestId('beta-label')).toBeInTheDocument()
    expect(screen.getByTestId('github-repo-btn')).toHaveAttribute('href', EXTERNAL_LINKS.githubRepo)
    expect(screen.getByTestId('github-repo-icon')).toBeInTheDocument()
  })

  it('should render show hidden checkbox when there are some hidden', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS', hide: true }, { name: 'setPassword' }] },
      isContentVisible: true
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.getByTestId('checkbox-show-hidden')).toBeInTheDocument()
  })

  it('should not render show hidden checkbox when there are no any hidden', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS', hide: false }, { name: 'setPassword' }] },
      isContentVisible: true
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.queryByTestId('checkbox-show-hidden')).not.toBeInTheDocument()
  })

  it('should send INSIGHTS_PANEL_CLOSED telemetry event', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }, { name: 'setPassword' }],
      },
      isContentVisible: false
    }))

    render(<LiveTimeRecommendations />)

    await act(() => {
      fireEvent.click(screen.getByTestId('recommendations-trigger'))
    })
    await act(() => {
      fireEvent.click(screen.getByTestId('recommendations-trigger'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: 'instanceId',
        list: ['optimizeTimeSeries', 'setPassword'],
        total: 2,
        provider: 'RE_CLOUD'
      }
    })
    sendEventTelemetry.mockRestore()
  })

  it('should call proper actions after render', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
      isContentVisible: false,
    }))

    render(<LiveTimeRecommendations />)

    const expectedActions = [getRecommendations()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions after click open insights button', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
      isContentVisible: false,
    }))

    await act(() => {
      render(<LiveTimeRecommendations />)
    })

    const afterRenderActions = [...store.getActions()]

    await act(() => {
      fireEvent.click(screen.getByTestId('recommendations-trigger'))
    })

    const expectedActions = [setIsContentVisible(true)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should properly push history on databaseAnalysis page', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }],
      },
      isContentVisible: true
    }))
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('footer-db-analysis-link'));

    (async () => {
      await waitForEuiPopoverVisible()
    })()

    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        total: 1,
        provider: 'RE_CLOUD'
      }
    })
    sendEventTelemetry.mockRestore()
  })

  it('should call "setIsContentVisible" after click close btn', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
      },
      isContentVisible: true
    }))
    render(<LiveTimeRecommendations />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(document.querySelector('.euiFlyout__closeButton')!)

    const expectedActions = [setIsContentVisible(false)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should send INSIGHTS_RECOMMENDATION_SHOW_HIDDEN telemetry event', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: RECOMMENDATIONS_DATA_MOCK
    }))

    const { queryByTestId } = render(<LiveTimeRecommendations />)

    fireEvent.click(queryByTestId('checkbox-show-hidden')!)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_SHOW_HIDDEN,
      eventData: {
        databaseId: 'instanceId',
        list: RECOMMENDATIONS_DATA_MOCK.recommendations?.map(({ name }) =>
          recommendationsContent[name].telemetryEvent || name),
        total: 2,
        action: 'show',
        provider: 'RE_CLOUD'
      }
    })
    sendEventTelemetry.mockRestore()
  })

  it('should render only not hide recommendations is showHiddenRecommendations=false', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: RECOMMENDATIONS_DATA_MOCK
    }))
    const { queryByTestId } = render(<LiveTimeRecommendations />)

    expect(queryByTestId('redisSearch-recommendation')).toBeInTheDocument()
    expect(queryByTestId('bigHashes-recommendation')).not.toBeInTheDocument()
  })

  it('should render all recommendations is showHiddenRecommendations=true', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: RECOMMENDATIONS_DATA_MOCK
    }));
    (appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: true,
    }))
    render(<LiveTimeRecommendations />)

    expect(screen.getByTestId('redisSearch-recommendation')).toBeInTheDocument()
    expect(screen.getByTestId('bigHashes-recommendation')).toBeInTheDocument()
  })

  it('should call "setRecommendationsShowHidden" after click hide/unhide btn', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: RECOMMENDATIONS_DATA_MOCK
    }));
    (appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: true,
    }))
    const { queryByTestId } = render(<LiveTimeRecommendations />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(queryByTestId('checkbox-show-hidden')!)

    const expectedActions = [setRecommendationsShowHidden(false)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should render WelcomeScreen if no visible recommendations', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: {
        ...RECOMMENDATIONS_DATA_MOCK,
        recommendations: RECOMMENDATIONS_DATA_MOCK.recommendations.map((rec) => ({ ...rec, hide: true }))
      }
    }));
    (appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: false,
    }))

    const { queryByTestId } = render(<LiveTimeRecommendations />)

    expect(queryByTestId('redisSearch-recommendation')).not.toBeInTheDocument()
    expect(queryByTestId('bigHashes-recommendation')).not.toBeInTheDocument()
    expect(queryByTestId('no-recommendations-screen')).toBeInTheDocument()
  })

  it('should not render recommendations count with totalUnread = 0', () => {
    (recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 0,
      },
      isContentVisible: false,
    }))

    render(<LiveTimeRecommendations />)

    expect(screen.queryByTestId('recommendations-unread-count')).not.toBeInTheDocument()
  })

  it('should render recommendations count with totalUnread > 0', () => {
    (recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 7,
      },
      isContentVisible: false,
    }))

    render(<LiveTimeRecommendations />)

    expect(screen.getByTestId('recommendations-unread-count')).toHaveTextContent('7')
  })
})
