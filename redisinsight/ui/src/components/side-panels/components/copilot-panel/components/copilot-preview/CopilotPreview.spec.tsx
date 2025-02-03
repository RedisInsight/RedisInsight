import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import CopilotPreview from './CopilotPreview'

describe('CopilotPreview', () => {
  it('should render', () => {
    expect(render(<CopilotPreview />)).toBeTruthy()
  })
})
