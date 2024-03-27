import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import OAuthRecommendedSettings from './OAuthRecommendedSettings'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSsoRecommendedSettings: {
      flag: true
    }
  }),
}))

describe('OAuthRecommendedSettings', () => {
  it('should render', () => {
    expect(render(<OAuthRecommendedSettings value onChange={jest.fn} />)).toBeTruthy()
  })

  it('should call onChange after change value', () => {
    const onChange = jest.fn()
    render(<OAuthRecommendedSettings value onChange={onChange} />)

    fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))

    expect(onChange).toBeCalledWith(false)
  })
})
