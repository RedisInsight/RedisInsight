import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoYaml from './MonacoYaml'

describe('MonacoYaml', () => {
  it('should render', () => {
    expect(render(<MonacoYaml value="val" onChange={jest.fn()} />)).toBeTruthy()
  })
})
