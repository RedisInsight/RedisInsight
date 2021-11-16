import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import NavigationMenu from './NavigationMenu'

describe('NavigationMenu', () => {
  it('should render', () => {
    expect(render(<NavigationMenu />)).toBeTruthy()
  })
})
