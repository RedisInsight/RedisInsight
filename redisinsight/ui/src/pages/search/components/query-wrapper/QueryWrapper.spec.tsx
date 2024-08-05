import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import QueryWrapper from './QueryWrapper'

describe('Query', () => {
  it('should render', () => {
    expect(render(<QueryWrapper onSubmit={jest.fn()} />)).toBeTruthy()
  })
})
