import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ResultsHistory from './ResultsHistory'

describe('ResultsHistory', () => {
  it('should render', () => {
    expect(render(<ResultsHistory onSubmit={jest.fn()} />)).toBeTruthy()
  })
})
