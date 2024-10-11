import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ClickableAppendInfo from './ClickableAppendInfo'

describe('ClickableAppendInfo', () => {
  it('should render', () => {
    expect(
      render(
        <ClickableAppendInfo />
      )
    ).toBeTruthy()
  })

  it('should open popover on click', async () => {
    render(<ClickableAppendInfo />)
    fireEvent.click(screen.getByTestId('append-info-icon'))
    expect(screen.getByTestId('pub-sub-examples')).toBeInTheDocument()
  })
})
