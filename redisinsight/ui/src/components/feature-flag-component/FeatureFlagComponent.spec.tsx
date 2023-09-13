import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants'

import FeatureFlagComponent from './FeatureFlagComponent'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    name: {
      flag: false
    }
  }),
}))

const InnerComponent = () => (<span data-testid="inner-component" />)
const OtherwiseComponent = () => (<span data-testid="otherwise-component" />)
describe('FeatureFlagComponent', () => {
  it('should not render component by default', () => {
    render(
      <FeatureFlagComponent name={'name' as FeatureFlags}>
        <InnerComponent />
      </FeatureFlagComponent>
    )

    expect(screen.queryByTestId('inner-component')).not.toBeInTheDocument()
  })

  it('should render component', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      name: {
        flag: true
      }
    })

    render(
      <FeatureFlagComponent name={'name' as FeatureFlags}>
        <InnerComponent />
      </FeatureFlagComponent>
    )

    expect(screen.getByTestId('inner-component')).toBeInTheDocument()
  })

  it('should render otherwise component if the feature flag not enabled', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      name: {
        flag: false
      }
    })

    const { queryByTestId } = render(
      <FeatureFlagComponent
        name={'name' as FeatureFlags}
        otherwise={<OtherwiseComponent />}
      >
        <InnerComponent />
      </FeatureFlagComponent>
    )

    expect(queryByTestId('inner-component')).not.toBeInTheDocument()
    expect(queryByTestId('otherwise-component')).toBeInTheDocument()
  })
})
