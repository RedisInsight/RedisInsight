import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import WelcomeScreen from './WelcomeScreen'

describe('WelcomeScreen', () => {
  it('should render', () => {
    expect(render(<WelcomeScreen />)).toBeTruthy()
  })
})
