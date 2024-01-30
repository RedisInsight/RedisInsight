import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ExplorePanelTemplate from './ExplorePanelTemplate'

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

describe('ExplorePanelTemplate', () => {
  it('should render', () => {
    expect(render(<ExplorePanelTemplate><div /></ExplorePanelTemplate>)).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(<ExplorePanelTemplate><div data-testid="children" /></ExplorePanelTemplate>)

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument()
  })
})
