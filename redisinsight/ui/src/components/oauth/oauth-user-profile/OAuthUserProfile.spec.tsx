import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { fireEvent } from '@testing-library/react'
import { act, cleanup, mockedStore, render, screen,
  waitForEuiPopoverVisible,
  mockedStoreFn,
} from 'uiSrc/utils/test-utils'

import { getUserInfo, logoutUser, oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { loadSubscriptionsRedisCloud, setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { MOCK_OAUTH_USER_PROFILE } from 'uiSrc/mocks/data/oauth'

import OAuthUserProfile, { Props } from './OAuthUserProfile'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore

describe('OAuthUserProfile', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStoreFn())
    store.clearActions()
  })

  it('should render', () => {
    expect(render(<OAuthUserProfile {...mockedProps} />)).toBeTruthy()
  })

  it('should render sign in button if no profile', () => {
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.getByTestId('cloud-sign-in-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('user-profile-btn')).not.toBeInTheDocument()
  })

  it('should render profile button', () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: {}
    })
    render(<OAuthUserProfile {...mockedProps} />)

    expect(screen.getByTestId('user-profile-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('cloud-sign-in-btn')).not.toBeInTheDocument()
  })

  it('should render profile info', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForEuiPopoverVisible()

    expect(screen.getByTestId('account-full-name')).toHaveTextContent('Bill Russell')
    expect(screen.getByTestId('profile-account-1-selected')).toHaveTextContent('Bill R #1')
    expect(screen.getByTestId('profile-account-2')).toHaveTextContent('Bill R 2 #2')
  })

  it('should call proper action and telemetry after click on import databases', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForEuiPopoverVisible();

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('profile-import-cloud-databases'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: OAuthSocialSource.UserProfile
      }
    })

    expect(store.getActions()).toEqual([setSSOFlow(OAuthSocialAction.Import), loadSubscriptionsRedisCloud()]);

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action and telemetry after click on account', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForEuiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_PROFILE_OPENED,
    })

    fireEvent.click(screen.getByTestId('profile-account-2'))

    expect(store.getActions()).toEqual([getUserInfo()]);

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action and telemetry after click on cloud link', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitForEuiPopoverVisible();

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('cloud-console-link'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_CONSOLE_CLICKED,
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper action after click on logout', async () => {
    (oauthCloudUserSelector as jest.Mock).mockReturnValue({
      data: MOCK_OAUTH_USER_PROFILE
    })
    render(<OAuthUserProfile {...mockedProps} />, { store })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })

    await waitForEuiPopoverVisible()

    fireEvent.click(screen.getByTestId('profile-logout'))

    expect(store.getActions()).toEqual([logoutUser()])
  })
})
