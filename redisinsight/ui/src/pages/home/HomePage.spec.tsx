import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('should render', () => {
    expect(render(<HomePage />)).toBeTruthy()
  })
})
