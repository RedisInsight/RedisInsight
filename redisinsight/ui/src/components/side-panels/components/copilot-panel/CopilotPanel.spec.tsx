import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import { aiAssistantSelector } from 'uiSrc/slices/panels/aiAssistant'
import CopilotPanel, { Props } from './CopilotPanel'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiAssistantSelector: jest.fn().mockReturnValue({
    hideCopilotSplashScreen: null
  })
}))

describe('CopilotPanel', () => {
  it('should render', () => {
    expect(render(<CopilotPanel {...mockedProps} />)).toBeTruthy()
  })

  it('should display SplashScreen when hideCopilotSplashScreen is not set to true', () => {
    render(<CopilotPanel {...mockedProps} />)

    expect(screen.getByTestId('copilot-get-started-btn')).toBeInTheDocument()
  })

  it('should not display SplashScreen when hideCopilotSplashScreen is set to true', () => {
    (aiAssistantSelector as jest.Mock).mockReturnValueOnce({
      hideCopilotSplashScreen: true
    })
    render(<CopilotPanel {...mockedProps} />)

    expect(screen.queryAllByTestId('copilot-get-started-btn')).toHaveLength(0)
  })
})
