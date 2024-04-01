import React from 'react'
import { cloneDeep } from 'lodash'
import { act, cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  addFreeDb,
  getPlans,
  oauthCloudUserSelector,
  setJob,
  setSocialDialogState,
  showOAuthProgress,
  signIn
} from 'uiSrc/slices/oauth/cloud'
import { setIsRecommendedSettingsSSO, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import OAuthCreateDb from './OAuthCreateDb'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSsoRecommendedSettings: {
      flag: true
    }
  }),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthCreateDb', () => {
  it('should render proper components ', () => {
    expect(render(<OAuthCreateDb />)).toBeTruthy()
  })

  it('should render proper components if user is not logged in', () => {
    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-container-social-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()
  })

  it('should call proper actions after click on sign button', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption: 'Google',
        action: 'create',
        cloudRecommendedSettings: 'enabled'
      }
    })

    const expectedActions = [signIn(), setIsRecommendedSettingsSSO(true)]
    expect(store.getActions()).toEqual(expectedActions);
    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render proper components if user is logged in', () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    expect(screen.getByTestId('oauth-advantages')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-create-db')).toBeInTheDocument()
    expect(screen.getByTestId('oauth-recommended-settings-checkbox')).toBeInTheDocument()

    expect(screen.queryByTestId('oauth-agreement-checkbox')).not.toBeInTheDocument()
    expect(screen.queryByTestId('oauth-container-social-buttons')).not.toBeInTheDocument()
  })

  it('should call proper actions after click create', () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    fireEvent.click(screen.getByTestId('oauth-create-db'))

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(null),
      setJob({ id: '', name: CloudJobName.CreateFreeSubscriptionAndDatabase, status: '' }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)),
      addFreeDb()
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions after click create without recommened settings', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<OAuthCreateDb />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('oauth-recommended-settings-checkbox'))
    })

    fireEvent.click(screen.getByTestId('oauth-create-db'))

    const expectedActions = [
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(null),
      setJob({ id: '', name: CloudJobName.CreateFreeSubscriptionAndDatabase, status: '' }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials)),
      getPlans()
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
