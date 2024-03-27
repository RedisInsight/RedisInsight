import React from 'react'
import { cloneDeep } from 'lodash'
import { render, cleanup, mockedStore, fireEvent, screen } from 'uiSrc/utils/test-utils'

import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import { CloudAuthSocial, IpcInvokeEvent } from 'uiSrc/electron/constants'
import { signIn } from 'uiSrc/slices/oauth/cloud'

import OAuthSocialButtons from './OAuthSocialButtons'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudSelector: jest.fn().mockReturnValue({
    source: 'source',
  }),
  oauthCloudPAgreementSelector: jest.fn().mockReturnValue(true),
}))

let store: typeof mockedStore
const invokeMock = jest.fn()
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock }
  } as any
})

describe('OAuthSocialButtons', () => {
  it('should render', () => {
    expect(render(<OAuthSocialButtons action={OAuthSocialAction.Create} />)).toBeTruthy()
  })

  it('should call proper actions after click on google', () => {
    const onClick = jest.fn()
    render(<OAuthSocialButtons action={OAuthSocialAction.Create} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('google-oauth'))

    expect(onClick).toBeCalledWith('Google')

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, {
      action: OAuthSocialAction.Create, strategy: CloudAuthSocial.Google
    })

    const expectedActions = [signIn()]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore()
  })

  it('should call proper actions after click on github', () => {
    const onClick = jest.fn()
    render(<OAuthSocialButtons action={OAuthSocialAction.Import} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('github-oauth'))

    expect(onClick).toBeCalledWith('GitHub')

    expect(invokeMock).toBeCalledTimes(1)
    expect(invokeMock).toBeCalledWith(IpcInvokeEvent.cloudOauth, {
      action: OAuthSocialAction.Import, strategy: CloudAuthSocial.Github
    })
    invokeMock.mockRestore()

    const expectedActions = [signIn()]
    expect(store.getActions()).toEqual(expectedActions)

    invokeMock.mockRestore()
  })
})
