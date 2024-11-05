import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, fireEvent } from 'uiSrc/utils/test-utils'

import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { setSocialDialogState } from 'uiSrc/slices/oauth/cloud'
import CreateCloud from './CreateCloud'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true
    }
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CreateCloud', () => {
  it('should render', () => {
    expect(render(<CreateCloud />)).toBeTruthy()
  })

  it('should call proper actions on click cloud button', () => {
    const { container } = render(<CreateCloud />)
    const createCloudLink = container.querySelector('[data-test-subj="create-cloud-nav-link"]')

    fireEvent.click(createCloudLink as Element)

    expect(store.getActions()).toEqual([
      setSSOFlow(OAuthSocialAction.Create),
      setSocialDialogState(OAuthSocialSource.NavigationMenu)
    ])
  })
})
