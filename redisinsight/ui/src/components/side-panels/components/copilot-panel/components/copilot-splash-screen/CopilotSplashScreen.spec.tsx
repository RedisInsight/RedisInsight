import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import CopilotSplashScreen, { Props } from './CopilotSplashScreen'

const mockedProps = mock<Props>()

describe('CopilotSplashScreen', () => {
  it('should render', () => {
    expect(render(<CopilotSplashScreen {...mockedProps} />)).toBeTruthy()
  })

  it('should call onClose when close Panel Btn is clicked', () => {
    const onClose = jest.fn()
    render(<CopilotSplashScreen {...mockedProps} onClose={onClose} />)

    fireEvent.click(screen.getByTestId('close-copilot-splashscreen-btn'))
    expect(onClose).toBeCalled()
  })
})
