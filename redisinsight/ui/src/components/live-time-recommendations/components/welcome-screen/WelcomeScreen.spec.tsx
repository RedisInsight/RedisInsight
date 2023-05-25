import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { setIsContentVisible, recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fireEvent, mockedStore, screen, cleanup, render, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { getDBAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'

import WelcomeScreen from './WelcomeScreen'

let store: typeof mockedStore

const mockRecommendationsSelector = jest.requireActual('uiSrc/slices/recommendations/recommendations')

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
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

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WelcomeScreen', () => {
  it('should render', () => {
    expect(render(<WelcomeScreen />)).toBeTruthy()
  })

  it('should properly push history on workbench page', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))

    await waitForEuiPopoverVisible()
    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
  })

  it('should call "setIsContentVisible" after click link btn', () => {
    render(<WelcomeScreen />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'));

    (async () => {
      await waitForEuiPopoverVisible()
    })()

    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    const expectedActions = [setIsContentVisible(false), getDBAnalysis()]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should call telemetry INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED after click link btn', async () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }],
      },
    }))

    render(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))
    await waitForEuiPopoverVisible()
    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

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
})
