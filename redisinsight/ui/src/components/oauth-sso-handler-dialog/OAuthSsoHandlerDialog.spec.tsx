import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { oauthCloudAccountSelector, setSignInDialogState } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import OAuthSsoHandlerDialog from './OAuthSsoHandlerDialog'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudAccountSelector: jest.fn().mockReturnValue(null),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    }
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const childrenMock = (
  onClick: (e: React.MouseEvent, source: SignInDialogSource) => void,
  source: SignInDialogSource,
) => (
  <div
    onClick={(e) => onClick(e, source)}
    onKeyDown={() => {}}
    data-testid="link"
    aria-label="link"
    role="link"
    tabIndex={0}
  >
    link
  </div>
)

afterEach(() => {
  (sendEventTelemetry as jest.Mock).mockRestore()
})

describe('OAuthSsoHandlerDialog', () => {
  it('should render', () => {
    expect(render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )).toBeTruthy()
  })

  it(`setSignInDialogState should not called if ${FeatureFlags.cloudSso} is not enabled`, () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )

    expect(sendEventTelemetry).not.toBeCalled()
    expect(store.getActions()).toEqual([])
  })

  it(`setSignInDialogState should called if ${FeatureFlags.cloudSso} is enabled and user not signed in`, () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);

    (appFeatureFlagsFeaturesSelector as jest.Mock).mockImplementation(() => (
      { [FeatureFlags.cloudSso]: { flag: true } }
    ))

    const { queryByTestId } = render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )

    fireEvent.click(queryByTestId('link'))

    const expectedActions = [setSignInDialogState(SignInDialogSource.BrowserContentMenu)]
    expect(store.getActions()).toEqual(expectedActions)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: SignInDialogSource.BrowserContentMenu
      }
    })
  })

  it(`setSignInDialogState should not called if ${FeatureFlags.cloudSso} is enabled and user signed in`, () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock);
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockImplementation(() => (
      { [FeatureFlags.cloudSso]: { flag: true } }
    ));
    (oauthCloudAccountSelector as jest.Mock).mockImplementation(() => (
      { id: '123' }
    ))

    const { queryByTestId } = render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )

    fireEvent.click(queryByTestId('link'))

    expect(sendEventTelemetry).not.toBeCalled()
    expect(store.getActions()).toEqual([])
  })
})
