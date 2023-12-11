import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, waitForEuiToolTipVisible, act } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { CloudAuthSocial, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { setOAuthCloudSource, signIn, oauthCloudPAgreementSelector } from 'uiSrc/slices/oauth/cloud'
import { setIsAutodiscoverySSO, setIsRecommendedSettingsSSO } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants'
import OAuthSocial, { OAuthSocialType } from './OAuthSocial'

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

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
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
        action: 'create',
        recommendedSettings: null
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, { action: 'create', strategy: CloudAuthSocial.Google })

    const expectedActions = [signIn(), setIsAutodiscoverySSO(false), setIsRecommendedSettingsSSO(undefined)]
    expect(store.getActions()).toEqual(expectedActions)

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
        action: 'create',
        recommendedSettings: null
      }
    })

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, { action: 'create', strategy: CloudAuthSocial.Github })
    invokeMock.mockRestore()

    const expectedActions = [signIn(), setIsAutodiscoverySSO(false), setIsRecommendedSettingsSSO(undefined)]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore();
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  describe('Recommended Settings Enabled', () => {
    beforeEach(() => {
      (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
        [FeatureFlags.cloudSsoRecommendedSettings]: {
          flag: true
        }
      })
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
          action: 'create',
          recommendedSettings: 'enabled'
        }
      })

      expect(invokeMock).toBeCalledTimes(1)
      expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, { action: 'create', strategy: CloudAuthSocial.Google })

      const expectedActions = [signIn(), setIsAutodiscoverySSO(false), setIsRecommendedSettingsSSO(true)]
      expect(store.getActions()).toEqual(expectedActions)

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
          action: 'create',
          recommendedSettings: 'enabled'
        }
      })

      expect(invokeMock).toBeCalledTimes(1)
      expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, { action: 'create', strategy: CloudAuthSocial.Github })
      invokeMock.mockRestore()

      const expectedActions = [signIn(), setIsAutodiscoverySSO(false), setIsRecommendedSettingsSSO(true)]
      expect(store.getActions()).toEqual(expectedActions)

      invokeMock.mockRestore();
      (sendEventTelemetry as jest.Mock).mockRestore()
    })
  })

  describe('Autodiscovery', () => {
    it('should send telemetry after click on google btn', async () => {
      const sendEventTelemetryMock = jest.fn();
      (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

      const { queryByTestId } = render(<OAuthSocial type={OAuthSocialType.Autodiscovery} />)

      fireEvent.click(queryByTestId('google-oauth') as HTMLButtonElement)

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
        eventData: {
          accountOption: 'Google',
          action: 'import',
        }
      })

      expect(invokeMock).toBeCalledTimes(1)
      expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, { action: 'import', strategy: CloudAuthSocial.Google })

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

  it('should render disabled google button with tooltip', async () => {
    (oauthCloudPAgreementSelector as jest.Mock).mockImplementation(() => false)

    const { queryByTestId } = render(<OAuthSocial />)

    expect(queryByTestId('google-oauth')).toBeDisabled()

    await act(async () => {
      fireEvent.mouseOver(queryByTestId('google-oauth') as HTMLElement)
    })

    await waitForEuiToolTipVisible()

    expect(queryByTestId('google-oauth-tooltip')).toBeInTheDocument()
    expect(queryByTestId('google-oauth-tooltip')).toHaveTextContent('Acknowledge the agreement')
  })

  it('should render disabled github button with tooltip', async () => {
    (oauthCloudPAgreementSelector as jest.Mock).mockImplementation(() => false)

    const { queryByTestId } = render(<OAuthSocial />)

    expect(queryByTestId('github-oauth')).toBeDisabled()

    await act(async () => {
      fireEvent.mouseOver(queryByTestId('github-oauth') as HTMLElement)
    })

    await waitForEuiToolTipVisible()

    expect(queryByTestId('github-oauth-tooltip')).toBeInTheDocument()
    expect(queryByTestId('github-oauth-tooltip')).toHaveTextContent('Acknowledge the agreement')
  })

  it('should not render tooltip', async () => {
    (oauthCloudPAgreementSelector as jest.Mock).mockImplementation(() => true)

    const { queryByTestId } = render(<OAuthSocial />)

    expect(queryByTestId('github-oauth')).not.toBeDisabled()

    await act(async () => {
      fireEvent.mouseOver(queryByTestId('github-oauth') as HTMLElement)
    })

    expect(queryByTestId('github-oauth-tooltip')).not.toBeInTheDocument()
  })
})
