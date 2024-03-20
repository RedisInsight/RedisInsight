import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import AutoDiscoveryPageTemplate from './AutoDiscoveryPageTemplate'

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

describe('AutoDiscoveryPageTemplate', () => {
  it('should render', () => {
    expect(render(<AutoDiscoveryPageTemplate>1</AutoDiscoveryPageTemplate>)).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(<AutoDiscoveryPageTemplate><div data-testid="children" /></AutoDiscoveryPageTemplate>)

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument()
  })
})
