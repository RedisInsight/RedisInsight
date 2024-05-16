import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen, act } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setOAuthCloudSource, signIn } from 'uiSrc/slices/oauth/cloud'
import WelcomeAiAssistant from './WelcomeAiAssistant'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WelcomeAiAssistant', () => {
  it('should render', () => {
    expect(render(<WelcomeAiAssistant />)).toBeTruthy()
  })

  it('should render sign in form', () => {
    render(<WelcomeAiAssistant />)

    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()
  })

  it('should call proper actions after click on social button', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<WelcomeAiAssistant />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('google-oauth'))
    })

    expect(store.getActions()).toEqual([signIn(), setOAuthCloudSource(OAuthSocialSource.AiChat)])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'Google',
        action: OAuthSocialAction.SignIn,
        source: OAuthSocialSource.AiChat
      }
    });
    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
