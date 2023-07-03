import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import MoreInfoPopover from './MoreInfoPopover'

describe('MoreInfoPopover', () => {
  it('should render', () => {
    expect(render(<MoreInfoPopover metrics={[]} modules={[]} />)).toBeTruthy()
  })
})
