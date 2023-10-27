import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { recommendationsSelector, resetRecommendationsHighlighting } from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import InsightsTrigger from './InsightsTrigger'

let store: typeof mockedStore

jest.mock('uiSrc/slices/recommendations/recommendations', () => ({
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  recommendationsSelector: jest.fn().mockReturnValue({
    isHighlighted: false
  }),
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

    expect(store.getActions()).toEqual([toggleInsightsPanel()])
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
      toggleInsightsPanel()
    ])
  })
})
