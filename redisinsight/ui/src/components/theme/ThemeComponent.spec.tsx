import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ThemeComponent from './ThemeComponent'

describe('ThemeComponent', () => {
  it('should render', () => {
    expect(render(<ThemeComponent />)).toBeTruthy()
  })
})
