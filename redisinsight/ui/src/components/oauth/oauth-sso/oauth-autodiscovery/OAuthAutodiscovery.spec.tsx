import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { CloudAuthSocial, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { oauthCloudUserSelector, setOAuthCloudSource, signIn } from 'uiSrc/slices/oauth/cloud'
import { loadSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { MOCK_OAUTH_USER_PROFILE } from 'uiSrc/mocks/data/oauth'
import OAuthAutodiscovery from './OAuthAutodiscovery'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null
  }),
}))

const invokeMock = jest.fn()
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock }
  } as any
})

describe('OAuthAutodiscovery', () => {
  it('should render', () => {
    expect(render(<OAuthAutodiscovery />)).toBeTruthy()
  })

  it('should render social buttons when not logged in', () => {
    render(<OAuthAutodiscovery />)

    expect(screen.queryByTestId('github-oauth')).toBeInTheDocument()
    expect(screen.queryByTestId('google-oauth')).toBeInTheDocument()
  })

  it('should send telemetry after click on github btn', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<OAuthAutodiscovery />)

    fireEvent.click(screen.queryByTestId('github-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'GitHub',
        action: 'import',
        source: OAuthSocialSource.Autodiscovery
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(
      IpcInvokeEvent.cloudOauth,
      {
        action: OAuthSocialAction.Import,
        strategy: CloudAuthSocial.Github
      }
    )
    invokeMock.mockRestore()

    const expectedActions = [
      signIn(),
      setSSOFlow(OAuthSocialAction.Import),
      setOAuthCloudSource(OAuthSocialSource.Autodiscovery)
    ]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore();
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render discover button and call proper actions on click when logged in', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })

    render(<OAuthAutodiscovery />)

    fireEvent.click(screen.getByTestId('oauth-discover-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: 'autodiscovery'
      }
    })

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Import),
      loadSubscriptionsRedisCloud()
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
