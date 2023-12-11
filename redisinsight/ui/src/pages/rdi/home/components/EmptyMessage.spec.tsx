import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import EmptyMessage from './EmptyMessage'

describe('EmptyMessage', () => {
  it('should render', () => {
    expect(render(<EmptyMessage />)).toBeTruthy()
  })
})
