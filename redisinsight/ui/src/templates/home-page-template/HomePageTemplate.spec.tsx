import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { appInfoSelector } from 'uiSrc/slices/app/info'
import { BuildType } from 'uiSrc/constants/env'
import HomePageTemplate from './HomePageTemplate'

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appInfoSelector: jest.fn().mockReturnValue({
    server: {}
  })
}))

const mockAppInfoSelector = jest.requireActual('uiSrc/slices/app/info')

const ChildComponent = () => (<div data-testid="child" />)

describe('HomePageTemplate', () => {
  it('should render', () => {
    expect(render(<HomePageTemplate><ChildComponent /></HomePageTemplate>)).toBeTruthy()
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

  it('should render title for redis stack build', () => {
    (appInfoSelector as jest.Mock).mockImplementation(() => ({
      ...mockAppInfoSelector,
      server: {
        buildType: BuildType.RedisStack
      }
    }))

    render(<HomePageTemplate><ChildComponent /></HomePageTemplate>)

    expect(screen.queryByTestId('home-tabs')).not.toBeInTheDocument()
    expect(screen.getByTestId('page-header-title')).toBeInTheDocument()
  })
})
