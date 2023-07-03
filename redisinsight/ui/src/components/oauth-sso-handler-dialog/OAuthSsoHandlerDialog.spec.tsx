import React from 'react'
import { cloneDeep } from 'lodash'
import { act, cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { SignInDialogSource } from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants'
import { oauthCloudAccountSelector, setSignInDialogState } from 'uiSrc/slices/oauth/cloud'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import OAuthSsoHandlerDialog, { Props } from './OAuthSsoHandlerDialog'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// jest.mock('uiSrc/telemetry', () => ({
//   ...jest.requireActual('uiSrc/telemetry'),
//   sendEventTelemetry: jest.fn(),
// }))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudAccountSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: false,
    }
  }),
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

describe('OAuthSsoHandlerDialog', () => {
  it('should render', () => {
    expect(render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )).toBeTruthy()
  })

  it(`setSignInDialogState should not called if ${FeatureFlags.cloudSso} is not enabled`, () => {
    render(
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
      </OAuthSsoHandlerDialog>
    )

    expect(store.getActions()).toEqual([])
  })

  it.only(`setSignInDialogState should called if ${FeatureFlags.cloudSso} is enabled and user signed in`, async () => {
    // const oauthCloudAccountSelectorMock = jest.fn().mockReturnValue({ id: 'aoeuaoeuaoeu' });
    // (oauthCloudAccountSelector as jest.Mock).mockImplementation(() => ({ id: 'aoeuaoeuaoeu' }));
    (oauthCloudAccountSelector as jest.Mock).mockReturnValue(() => ({ id: 'aoeuaoeuaoeu' }))
    // (appFeatureFlagsFeaturesSelector as jest.Mock).mockImplementation(() => ({ flag: true }))

    await act(() => {
      const { queryByTestId } = render(<OAuthSsoHandlerDialog />)
    })

    // (oauthCloudAccountSelector as jest.Mock).mockImplementation(oauthCloudAccountSelectorMock)

    // const { queryByTestId, debug } = render(
    //   <OAuthSsoHandlerDialog>
    //     {(ssoCloudHandlerClick) => (childrenMock(ssoCloudHandlerClick, SignInDialogSource.BrowserContentMenu))}
    //   </OAuthSsoHandlerDialog>
    // )

    // fireEvent.click(queryByTestId('link'))

    expect(store.getActions()).toEqual([])
  })
})
