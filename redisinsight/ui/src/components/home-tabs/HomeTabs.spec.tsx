import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, act, cleanup, mockedStore } from 'uiSrc/utils/test-utils'

import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import HomeTabs from './HomeTabs'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    rdi: {
      flag: true
    },
  }),
}))

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
        tab: 'Redis Data Integration'
      }
    })
  })

  it('should not render rdi tab', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      rdi: {
        flag: false
      },
    })

    render(<HomeTabs />)

    expect(screen.queryByTestId('home-tab-rdi-instances')).not.toBeInTheDocument()
  })
})
