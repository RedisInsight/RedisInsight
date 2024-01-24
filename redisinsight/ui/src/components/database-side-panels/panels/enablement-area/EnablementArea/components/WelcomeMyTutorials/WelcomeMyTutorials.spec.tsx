import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import WelcomeMyTutorials from './WelcomeMyTutorials'

describe('WelcomeMyTutorials', () => {
  it('should render', () => {
    expect(render(<WelcomeMyTutorials handleOpenUpload={jest.fn()} />)).toBeTruthy()
  })

  it('should call handleOpenUpload', () => {
    const mockHandleOpenUpload = jest.fn()
    render(<WelcomeMyTutorials handleOpenUpload={mockHandleOpenUpload} />)

    fireEvent.click(screen.getByTestId('upload-tutorial-btn'))

    expect(mockHandleOpenUpload).toBeCalled()
  })
})
