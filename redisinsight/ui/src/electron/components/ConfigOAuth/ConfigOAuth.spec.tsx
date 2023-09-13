import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ConfigOAuth from './ConfigOAuth'

describe('ConfigOAuth', () => {
  it('should render', () => {
    expect(render(<ConfigOAuth />)).toBeTruthy()
  })
})
