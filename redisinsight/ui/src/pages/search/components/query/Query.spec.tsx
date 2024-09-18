import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import Query from './Query'

describe('Query', () => {
  it('should render', () => {
    expect(render(<Query onChange={jest.fn} value="" indexes={[]} />)).toBeTruthy()
  })
})
