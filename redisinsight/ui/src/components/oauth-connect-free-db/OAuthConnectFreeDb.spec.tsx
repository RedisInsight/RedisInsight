import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { CloudAuthSocial, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { setOAuthCloudSource, signIn } from 'uiSrc/slices/oauth/cloud'
import { setIsAutodiscoverySSO } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import OAuthConnectFreeDb, { OAuthSocialType } from './OAuthConnectFreeDb'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
}))

let store: typeof mockedStore
const invokeMock = jest.fn()
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock }
  }
})

describe('OAuthConnectFreeDb', () => {
  it('should render', () => {
    expect(render(<OAuthConnectFreeDb />)).toBeTruthy()
  })

  it('should send telemetry after click on google btn', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthConnectFreeDb />)

    fireEvent.click(queryByTestId('google-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'Google',
        source: 'source',
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, CloudAuthSocial.Google)

    const expectedActions = [signIn(), setIsAutodiscoverySSO(false)]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore();
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should send telemetry after click on github btn', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const { queryByTestId } = render(<OAuthConnectFreeDb />)

    fireEvent.click(queryByTestId('github-oauth') as HTMLButtonElement)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'GitHub',
        source: 'source',
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, CloudAuthSocial.Github)
    invokeMock.mockRestore()

    const expectedActions = [signIn(), setIsAutodiscoverySSO(false)]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore();
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  describe('Autodiscovery', () => {
    it('should send telemetry after click on google btn', async () => {
      const sendEventTelemetryMock = jest.fn();
      (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

      const { queryByTestId } = render(<OAuthConnectFreeDb type={OAuthSocialType.Autodiscovery} />)

      fireEvent.click(queryByTestId('google-oauth') as HTMLButtonElement)

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
        eventData: {
          accountOption: 'Google',
          source: 'source',
        }
      })

      expect(invokeMock).toBeCalledTimes(1)
      expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, CloudAuthSocial.Google)

      const expectedActions = [
        signIn(),
        setIsAutodiscoverySSO(true),
        setOAuthCloudSource(OAuthSocialSource.Autodiscovery),
      ]
      expect(store.getActions()).toEqual(expectedActions)

      expect(queryByTestId('oauth-container-autodiscovery')).toBeInTheDocument()

      invokeMock.mockRestore();
      (sendEventTelemetry as jest.Mock).mockRestore()
    })
  })
})
