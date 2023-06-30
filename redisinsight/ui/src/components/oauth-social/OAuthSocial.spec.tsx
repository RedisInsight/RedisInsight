import React from 'react'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'
import OAuthSocial from './OAuthSocial'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSignInDialogSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
}))

const invokeMock = jest.fn()
beforeEach(() => {
  window.app = {
    ipc: { invoke: invokeMock }
  }
})

describe('OAuthSocial', () => {
  it('should render', () => {
    expect(render(<OAuthSocial />)).toBeTruthy()
  })

  it('should send telemetry after click on google btn', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthSocial />)

    fireEvent.click(queryByTestId('google-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'Google',
        source: 'source',
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.getAppVersion)
    invokeMock.mockRestore();
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should send telemetry after click on github btn', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthSocial />)

    fireEvent.click(queryByTestId('github-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'GitHub',
        source: 'source',
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.getAppVersion)
    invokeMock.mockRestore();

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
