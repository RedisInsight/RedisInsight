import React from 'react'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import ChatForm from './ChatForm'

describe('ChatForm', () => {
  it('should render', () => {
    expect(render(<ChatForm onSubmit={jest.fn()} />)).toBeTruthy()
  })

  it('should submit value', () => {
    const onSubmit = jest.fn()
    render(<ChatForm onSubmit={onSubmit} />)

    expect(screen.getByTestId('ai-submit-message-btn')).toBeDisabled()

    act(() => {
      fireEvent.change(
        screen.getByTestId('ai-message-textarea'),
        { target: { value: 'test' } }
      )
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(onSubmit).toBeCalledWith('test')
  })

  it('should submit by enter', () => {
    const onSubmit = jest.fn()
    render(<ChatForm onSubmit={onSubmit} />)

    act(() => {
      fireEvent.change(
        screen.getByTestId('ai-message-textarea'),
        { target: { value: 'test' } }
      )
    })

    fireEvent.keyDown(screen.getByTestId('ai-message-textarea'), {
      key: 'Enter',
    })

    expect(onSubmit).toBeCalledWith('test')
  })
})
