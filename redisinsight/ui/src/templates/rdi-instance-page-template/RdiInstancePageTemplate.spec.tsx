import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import RdiInstancePageTemplate from './RdiInstancePageTemplate'

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

describe('RdiInstancePageTemplate', () => {
  it('should render', () => {
    expect(render(<RdiInstancePageTemplate>1</RdiInstancePageTemplate>)).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(<RdiInstancePageTemplate><div data-testid="children" /></RdiInstancePageTemplate>)

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument()
  })
})
