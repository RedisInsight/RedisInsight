import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import EmptySlowLog from './EmptySlowLog'

describe('EmptySlowLog', () => {
  it('should render', () => {
    expect(render(<EmptySlowLog />)).toBeTruthy()
  })
})
