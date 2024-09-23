import React from 'react'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import PatternsInfo from './PatternsInfo'

describe('PatternsInfo', () => {
  it('should render', () => {
    expect(
      render(
        <PatternsInfo />
      )
    ).toBeTruthy()
  })

  it('should show info text on hover', async () => {
    const content = 'hello'
    render(<PatternsInfo channels={content} />)
    expect(screen.getByText('Patterns: 1')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByTestId('append-info-icon'))
    await waitFor(() => screen.getByText(content))
    expect(screen.getByText(content)).toBeInTheDocument()
  })
})
