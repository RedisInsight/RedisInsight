import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import Skeleton from './Skeleton'

describe('Skeleton', () => {
  it('should render', () => {
    expect(render(<Skeleton />)).toBeTruthy()
  })
})
