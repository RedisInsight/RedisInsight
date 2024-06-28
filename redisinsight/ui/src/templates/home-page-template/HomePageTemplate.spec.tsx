import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { appInfoSelector } from 'uiSrc/slices/app/info'
import { BuildType } from 'uiSrc/constants/env'
import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import HomePageTemplate from './HomePageTemplate'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {}
  })
}))

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

const ChildComponent = () => (<div data-testid="child" />)

describe('HomePageTemplate', () => {
  it('should render', () => {
    expect(render(<HomePageTemplate><ChildComponent /></HomePageTemplate>)).toBeTruthy()
  })

  it('should render capability promotion component', () => {
    render(<HomePageTemplate><ChildComponent /></HomePageTemplate>)
    expect(screen.getByTestId('capability-promotion')).toBeInTheDocument()
  })

  it('should render tabs by default', () => {
    (appInfoSelector as jest.Mock).mockImplementation(() => ({
      ...mockAppInfoSelector,
      server: {
        buildType: BuildType.DockerOnPremise
      }
    }))

    render(<HomePageTemplate><ChildComponent /></HomePageTemplate>)

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('home-tabs')).toBeInTheDocument()
  })
})
