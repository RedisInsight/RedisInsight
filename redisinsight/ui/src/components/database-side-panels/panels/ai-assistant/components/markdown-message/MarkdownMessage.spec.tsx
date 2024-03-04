import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MarkdownMessage from './MarkdownMessage'

describe('MarkdownMessage', () => {
  it('should render', () => {
    expect(render(<MarkdownMessage>1</MarkdownMessage>)).toBeTruthy()
  })
})
