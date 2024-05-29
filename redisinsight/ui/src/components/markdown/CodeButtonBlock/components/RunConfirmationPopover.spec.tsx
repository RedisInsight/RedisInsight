import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import RunConfirmationPopover from './RunConfirmationPopover'

describe('RunConfirmationPopover', () => {
  it('should render', () => {
    expect(render(<RunConfirmationPopover onApply={jest.fn()} />)).toBeTruthy()
  })
})
