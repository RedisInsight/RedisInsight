import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import HomeTabs from './HomeTabs'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('HomeTabs', () => {
  it('should render', () => {
    expect(render(<HomeTabs />)).toBeTruthy()
  })

  it('should show database instances tab active', () => {
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.home })

    render(<HomeTabs />)

    expect(screen.getByTestId('home-tab-databases')).toHaveClass('euiTab-isSelected')
  })

  it('should show rdi instances tab active', () => {
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.rdi })

    render(<HomeTabs />)

    expect(screen.getByTestId('home-tab-rdi-instances')).toHaveClass('euiTab-isSelected')
  })

  it('should call proper history push', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.home })

    render(<HomeTabs />)

    act(() => {
      fireEvent.click(screen.getByTestId('home-tab-rdi-instances'))
    })

    expect(pushMock).toBeCalledWith(Pages.rdi)
  })

  it('should send proper telemetry', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    reactRouterDom.useLocation = jest.fn().mockReturnValue({ pathname: Pages.home })

    render(<HomeTabs />)

    act(() => {
      fireEvent.click(screen.getByTestId('home-tab-rdi-instances'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSTANCES_TAB_CHANGED,
      eventData: {
        tab: 'My RDI instances'
      }
    })
  })
})
