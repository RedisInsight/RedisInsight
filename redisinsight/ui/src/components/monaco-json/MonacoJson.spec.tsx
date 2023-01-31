import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoJson from './MonacoJson'

describe('', () => {
  it('should render', () => {
    expect(render(<MonacoJson value="val" onChange={jest.fn()} />)).toBeTruthy()
  })
})
