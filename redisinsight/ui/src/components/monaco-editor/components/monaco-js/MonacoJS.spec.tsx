import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoJS from './MonacoJS'

describe('MonacoJS', () => {
  it('should render', () => {
    expect(render(<MonacoJS value="val" onChange={jest.fn()} />)).toBeTruthy()
  })
})
