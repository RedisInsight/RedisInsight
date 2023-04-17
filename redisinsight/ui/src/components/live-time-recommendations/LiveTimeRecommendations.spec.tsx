import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  getRecommendations,
  recommendationsSelector,
  setIsContentVisible
} from 'uiSrc/slices/recommendations/recommendations'
import { fireEvent, screen, cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { RECOMMENDATIONS_DATA_MOCK } from 'uiSrc/mocks/handlers/recommendations/recommendationsHandler'
import { appContextDbConfig, setRecommendationsShowHidden } from 'uiSrc/slices/app/context'
import _content from 'uiSrc/constants/dbAnalysisRecommendations.json'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'

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

  it('should send INSIGHTS_PANEL_CLOSED telemetry event', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }, { name: 'setPassword' }],
      },
      isContentVisible: true
    }))

    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('recommendations-trigger'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: 'instanceId',
        list: ['optimizeTimeSeries', 'setPassword'],
        total: 2,
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

  it('should call proper actions after click open insights button', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
      isContentVisible: false,
    }))

    render(<LiveTimeRecommendations />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('recommendations-trigger'))

    const expectedActions = [getRecommendations(), setIsContentVisible(true)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should properly push history on databaseAnalysis page', () => {
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

    fireEvent.click(screen.getByTestId('footer-db-analysis-link'))
    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        total: 1,
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
        action: 'show'
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
})
