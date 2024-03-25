import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import OAuthSignIn from './OAuthSignIn'

describe('OAuthSignIn', () => {
  it('should render', () => {
    expect(render(<OAuthSignIn />)).toBeTruthy()
  })

  it('should render proper components for signIn', () => {
    render(<OAuthSignIn />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
  })
})
