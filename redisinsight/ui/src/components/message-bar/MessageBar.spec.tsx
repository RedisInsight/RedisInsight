import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import MessageBar, { Props } from './MessageBar'

const mockedProps = mock<Props>()
const CLOSE_BUTTON = 'close-button'

describe('MessageBar', () => {
  it('should render', () => {
    expect(render(<MessageBar {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render children', () => {
    render(
      <MessageBar opened>
        <p data-testid="text">lorem ipsum</p>
      </MessageBar>,
    )
    expect(screen.getByTestId('text')).toBeTruthy()
  })

  it('should close after click cancel', () => {
    render(<MessageBar opened />)

    expect(screen.getByTestId(CLOSE_BUTTON)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId(CLOSE_BUTTON))
    expect(screen.queryByTestId(CLOSE_BUTTON)).toBeNull()
  })
})
