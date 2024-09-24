import { cloneDeep } from 'lodash'
import React from 'react'

import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { localStorageService } from 'uiSrc/services'
import { oauthCloudPAgreementSelector, setAgreement } from 'uiSrc/slices/oauth/cloud'
import { BrowserStorageItem } from 'uiSrc/constants'
import { updateUserConfigSettings } from 'uiSrc/slices/user/user-settings'
import OAuthAgreement from './OAuthAgreement'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsConfigSelector: jest.fn().mockReturnValue({
    agreements: {
      eula: true,
      version: '1.0.1',
      analytics: false,
    },
  })
}))

describe('OAuthAgreement', () => {
  it('should render', () => {
    expect(render(<OAuthAgreement />)).toBeTruthy()
    expect(screen.getByTestId('oauth-agreement-checkbox')).toBeChecked()
  })

  it('should call setAgreement and set value in local storage', () => {
    localStorageService.set = jest.fn()

    render(<OAuthAgreement />)

    fireEvent.click(screen.getByTestId('oauth-agreement-checkbox'))

    const expectedActions = [
      setAgreement(false),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )

    expect(localStorageService.set).toBeCalledWith(
      BrowserStorageItem.OAuthAgreement,
      false,
    )
  })

  it('should update settings when checkbox checked if analytics is set to false', () => {
    (oauthCloudPAgreementSelector as jest.Mock).mockReturnValueOnce(false)

    render(<OAuthAgreement />)

    const el = screen.getByTestId('oauth-agreement-checkbox') as HTMLInputElement
    expect(el.checked).toBe(false)
    fireEvent.click(el)

    const expectedActions = [{}].fill(updateUserConfigSettings(), 0)
    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
