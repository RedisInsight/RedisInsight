import React from 'react'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import AppendInfo from './AppendInfo'

describe('InstancePage', () => {
  it('should render', () => {
    expect(
      render(
        <AppendInfo />
      )
    ).toBeTruthy()
  })

  it('should show info text on hover', async () => {
    const content = 'Some content'
    render(<AppendInfo content={content} />)
    fireEvent.mouseOver(screen.getByTestId('append-info-icon'))
    await waitFor(() => screen.getByText(content))
    expect(screen.getByText(content)).toBeInTheDocument()
  })
})
