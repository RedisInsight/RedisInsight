import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import Query from './Query'

describe('Query', () => {
  it('should render', () => {
    expect(render(<Query onSubmit={jest.fn()} />)).toBeTruthy()
  })
})
