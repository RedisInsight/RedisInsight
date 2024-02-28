import React from 'react'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { oauthCloudSelector } from 'uiSrc/slices/oauth/cloud'
import OAuthSignInDialog from './OAuthSignInDialog'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
    isOpenSignInDialog: true,
  }),
}))

describe('OAuthSignInDialog', () => {
  it('should render', () => {
    const { queryByTestId } = render(<OAuthSignInDialog />)
    expect(queryByTestId('oauth-sign-in-dialog')).toBeInTheDocument()
  })
  it('should not render if isOpenSignInDialog=false', () => {
    (oauthCloudSelector as jest.Mock).mockReturnValueOnce({
      isOpenSignInDialog: false,
    })
    const { queryByTestId } = render(<OAuthSignInDialog />)
    expect(queryByTestId('oauth-sign-in-dialog')).not.toBeInTheDocument()
  })

  it('should send telemetry after close modal', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthSignInDialog />)

    const closeEl = queryByTestId('oauth-sign-in-dialog')?.querySelector('.euiModal__closeIcon')

    fireEvent.click(closeEl as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_FORM_CLOSED,
      eventData: {
        action: '',
      }
    })
  })
})
