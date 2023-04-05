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

import LiveTimeRecommendations from './LiveTimeRecommendations'

let store: typeof mockedStore

const mockRecommendationsSelector = jest.requireActual('uiSrc/slices/recommendations/recommendations')

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

  it('should send INSIGHTS_RECOMMENDATIONS_OPENED telemetry event', () => {
    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('recommendations-trigger'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_OPENED,
      eventData: {
        databaseId: 'instanceId',
        list: [],
        total: 0,
      }
    })
    sendEventTelemetry.mockRestore()
  })

  it('should send INSIGHTS_RECOMMENDATIONS_CLOSED telemetry event', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
      },
      isContentVisible: true
    }))

    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('recommendations-trigger'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_CLOSED,
      eventData: {
        databaseId: 'instanceId',
        list: [],
        total: 0,
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

  it('should call "setIsContentVisible" action be called after click', () => {
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

    const expectedActions = [setIsContentVisible(true)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should properly push history on databaseAnalysis page', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
      },
      isContentVisible: true
    }))
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('database-analysis-link'))
    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
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

  it('should render recommendations', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      isContentVisible: true,
      data: RECOMMENDATIONS_DATA_MOCK
    }))
    render(<LiveTimeRecommendations />)

    expect(screen.getByTestId('redisSearch-recommendation')).toBeInTheDocument()
  })
})
