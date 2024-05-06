import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { AiChatErrors } from 'uiSrc/constants/apiErrors'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('should render', () => {
    expect(render(<ErrorMessage onRestart={jest.fn} />)).toBeTruthy()
  })

  it('should render error', () => {
    const onRestart = jest.fn()
    render(<ErrorMessage onRestart={onRestart} error={{ statusCode: 404 }} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(AiChatErrors.Default)
    expect(screen.getByTestId('ai-chat-error-report-link')).toBeInTheDocument()

    expect(screen.getByTestId('ai-general-restart-session-btn')).toBeInTheDocument()
  })

  it('should not render restart button with timeout error', () => {
    const onRestart = jest.fn()
    render(<ErrorMessage onRestart={onRestart} error={{ statusCode: 408 }} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(AiChatErrors.Timeout)
    expect(screen.getByTestId('ai-chat-error-report-link')).toBeInTheDocument()

    expect(screen.queryByTestId('ai-general-restart-session-btn')).not.toBeInTheDocument()
  })
})
