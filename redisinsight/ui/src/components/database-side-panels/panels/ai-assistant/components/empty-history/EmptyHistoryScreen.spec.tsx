import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import EmptyHistoryScreen from './EmptyHistoryScreen'

describe('EmptyHistoryScreen', () => {
  it('should render', () => {
    expect(render(<EmptyHistoryScreen />)).toBeTruthy()
  })

  it('should call submit when click on suggestion', () => {
    const onSubmit = jest.fn()
    render(<EmptyHistoryScreen suggestions={[{ inner: '', query: 'x' }]} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByTestId('ai-chat-suggestion_0'))

    expect(onSubmit).toBeCalledWith('x')
  })
})
