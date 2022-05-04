import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import StreamDetailsWrapper from './StreamDetailsWrapper'

describe('StreamDetailsWrapper', () => {
  it('should render', () => {
    expect(render(<StreamDetailsWrapper />)).toBeTruthy()
  })
})
