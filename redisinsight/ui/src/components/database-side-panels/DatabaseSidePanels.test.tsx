import React from 'react'
import { cloneDeep } from 'lodash'
import {
  getRecommendations,
  recommendationsSelector,
  setIsContentVisible
} from 'uiSrc/slices/recommendations/recommendations'
import { fireEvent, screen, cleanup, mockedStore, render, act } from 'uiSrc/utils/test-utils'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'

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

  it('should call proper actions after render', () => {
    (recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
      isContentVisible: false,
    }))

    render(<DatabaseSidePanels />)

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
      render(<DatabaseSidePanels />)
    })

    const afterRenderActions = [...store.getActions()]

    await act(() => {
      fireEvent.click(screen.getByTestId('recommendations-trigger'))
    })

    const expectedActions = [setIsContentVisible(true)]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
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

    render(<DatabaseSidePanels />)

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

    render(<DatabaseSidePanels />)

    expect(screen.getByTestId('recommendations-unread-count')).toHaveTextContent('7')
  })
})
