import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import HomePage from './HomePage'

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons'),
  contentSelector: () => jest.fn().mockReturnValue({ data: {}, loading: false }),
}))

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

/**
 * HomePage tests
 *
 * @group component
 */
describe('HomePage', () => {
  it('should render', async () => {
    expect(await render(<HomePage />)).toBeTruthy()
  })

  it('should render capability promotion section', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('capability-promotion')).toBeInTheDocument()
  })

  it('should render insights trigger', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('insights-trigger')).toBeInTheDocument()
  })

  it('should render insights panel', async () => {
    await render(<HomePage />)

    expect(screen.getByTestId('insights-panel')).toBeInTheDocument()
  })
})
