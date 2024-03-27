import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import AutodiscoveryPageTemplate from './AutodiscoveryPageTemplate'

jest.mock('uiSrc/slices/panels/insights', () => ({
  ...jest.requireActual('uiSrc/slices/panels/insights'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    isOpen: true
  }),
}))

describe('AutoDiscoveryPageTemplate', () => {
  it('should render', () => {
    expect(render(<AutodiscoveryPageTemplate>1</AutodiscoveryPageTemplate>)).toBeTruthy()
  })

  it('should render children and insights panel', () => {
    render(<AutodiscoveryPageTemplate><div data-testid="children" /></AutodiscoveryPageTemplate>)

    expect(screen.getByTestId('children')).toBeInTheDocument()
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument()
  })
})
