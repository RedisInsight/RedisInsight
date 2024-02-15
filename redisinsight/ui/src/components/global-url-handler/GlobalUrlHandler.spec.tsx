import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, mockedStore, render, act } from 'uiSrc/utils/test-utils'

import {
  appRedirectionSelector,
  setFromUrl, setUrlDbConnection,
  setUrlHandlingInitialState,
  setUrlProperties
} from 'uiSrc/slices/app/url-handling'
import { userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { Pages } from 'uiSrc/constants'
import { ADD_NEW, ADD_NEW_CA_CERT } from 'uiSrc/pages/home/constants'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import GlobalUrlHandler from './GlobalUrlHandler'

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    config: null,
    isShowConsents: null
  }),
}))

jest.mock('uiSrc/slices/app/url-handling', () => ({
  ...jest.requireActual('uiSrc/slices/app/url-handling'),
  appRedirectionSelector: jest.fn().mockReturnValue({
    fromUrl: ''
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const fromUrl = 'redisinsight://databases/connect?redisUrl=redis://default:password@localhost:6379&databaseAlias=My Name&redirect=workbench?guidePath=/quick-guides/document/introduction.md&cloudBdbId=1232&subscriptionType=fixed&planMemoryLimit=30&memoryLimitMeasurementUnit=mb&free=true&target=_blank'

describe('GlobalUrlHandler', () => {
  beforeEach(() => {
    reactRouterDom.useLocation = jest.fn().mockReturnValueOnce({ search: '' })
  })
  it('should render', () => {
    expect(render(<GlobalUrlHandler />)).toBeTruthy()
  })

  it('should not call any actions by default', () => {
    render(<GlobalUrlHandler />)
    expect(store.getActions()).toEqual([])
  })

  it('should store fromUrl to the state and clear search', () => {
    const search = `?from=${encodeURIComponent(fromUrl)}`

    const replaceMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ replace: replaceMock })
    reactRouterDom.useLocation = jest.fn().mockReturnValueOnce({ search })

    render(<GlobalUrlHandler />)
    expect(store.getActions()).toEqual([setFromUrl(decodeURIComponent(fromUrl))])

    expect(replaceMock).toBeCalledWith({ search: '' })
  })

  it('should call proper actions only after consents popup is accepted', async () => {
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    });

    (appRedirectionSelector as jest.Mock).mockReturnValueOnce({
      fromUrl
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(fromUrl)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    expect(store.getActions()).toEqual([
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlHandlingInitialState(),
      addInfiniteNotification(INFINITE_MESSAGES.AUTO_CREATING_DATABASE())
    ])
  })

  it('should call proper actions only after consents popup is accepted and open form to add db without name', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock });
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    })

    const url = fromUrl.replace('default', '');

    (appRedirectionSelector as jest.Mock).mockReturnValue({
      fromUrl: url
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(url)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    const expectedActions = [
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          host: 'localhost',
          name: 'My Name',
          password: 'password',
          port: 6379,
          tls: false,
          username: '',
          caCert: undefined,
          clientCert: undefined,
        }
      }),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)

    expect(pushMock).toBeCalledWith(Pages.home)
  })

  it('should call proper actions only after consents popup is accepted and open form to add db with caCert', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock });
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    })

    const url = `${fromUrl}&requiredCaCert=true`;

    (appRedirectionSelector as jest.Mock).mockReturnValueOnce({
      fromUrl: url
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(url)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    const expectedActions = [
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          host: 'localhost',
          name: 'My Name',
          password: 'password',
          port: 6379,
          tls: true,
          caCert: { id: ADD_NEW_CA_CERT },
          username: 'default',
        }
      })
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    expect(pushMock).toBeCalledWith(Pages.home)
  })

  it('should call proper actions only after consents popup is accepted and open form to add db with client cert', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock });
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    })

    const url = `${fromUrl}&requiredClientCert=true`;

    (appRedirectionSelector as jest.Mock).mockReturnValueOnce({
      fromUrl: url
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(url)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    const expectedActions = [
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          host: 'localhost',
          name: 'My Name',
          password: 'password',
          port: 6379,
          tls: true,
          caCert: undefined,
          clientCert: { id: ADD_NEW },
          username: 'default',
        }
      })
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    expect(pushMock).toBeCalledWith(Pages.home)
  })

  it('should call proper actions only after consents popup is accepted and open form to add db with tls certs', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock });
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    })

    const url = `${fromUrl}&requiredCaCert=true&requiredClientCert=true`;

    (appRedirectionSelector as jest.Mock).mockReturnValueOnce({
      fromUrl: url
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(url)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    const expectedActions = [
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          host: 'localhost',
          name: 'My Name',
          password: 'password',
          port: 6379,
          tls: true,
          caCert: { id: ADD_NEW_CA_CERT },
          clientCert: { id: ADD_NEW },
          username: 'default',
        }
      })
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    expect(pushMock).toBeCalledWith(Pages.home)
  })

  it('should call proper actions only after consents popup is accepted and open form to add db with tls', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValueOnce({ push: pushMock });
    (userSettingsSelector as jest.Mock).mockReturnValueOnce({
      config: {},
      isShowConsents: false
    })

    const url = `${fromUrl}&requiredTls=true`;

    (appRedirectionSelector as jest.Mock).mockReturnValueOnce({
      fromUrl: url
    })

    await act(() => {
      render(<GlobalUrlHandler />)
    })

    const actionUrl = new URL(url)
    const fromParams = new URLSearchParams(actionUrl.search)
    // @ts-ignore
    const urlProperties = Object.fromEntries(fromParams) || {}
    urlProperties.cloudId = urlProperties.cloudBdbId
    delete urlProperties.cloudBdbId

    const expectedActions = [
      setUrlProperties(urlProperties),
      setFromUrl(null),
      setUrlDbConnection({
        action: UrlHandlingActions.Connect,
        dbConnection: {
          host: 'localhost',
          name: 'My Name',
          password: 'password',
          port: 6379,
          tls: true,
          caCert: undefined,
          clientCert: undefined,
          username: 'default',
        }
      })
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(expectedActions)
    expect(pushMock).toBeCalledWith(Pages.home)
  })
})
