import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import WelcomeAiAssistant from './WelcomeAiAssistant'

describe('WelcomeAiAssistant', () => {
  it('should render', () => {
    expect(render(<WelcomeAiAssistant />)).toBeTruthy()
  })

  it('should render sign in form', () => {
    render(<WelcomeAiAssistant />)

    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()
  })
})
