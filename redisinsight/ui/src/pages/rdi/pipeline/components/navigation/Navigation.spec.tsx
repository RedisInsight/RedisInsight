import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import Navigation from './Navigation'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

describe('Navigation', () => {
  it('should render', () => {
    expect(render(<Navigation path="" />)).toBeTruthy()
  })

  it('should call proper history push after click on tabs', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<Navigation path="" />)

    fireEvent.click(screen.getByTestId('rdi-nav-btn-config'))
    expect(pushMock).toBeCalledWith('/integrate/undefined/pipeline/config')

    fireEvent.click(screen.getByTestId('rdi-nav-btn-prepare'))
    expect(pushMock).toBeCalledWith('/integrate/undefined/pipeline/prepare')
  })
})
