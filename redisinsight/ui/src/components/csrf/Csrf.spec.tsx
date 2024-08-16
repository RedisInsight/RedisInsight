import React from 'react'
import { cloneDeep } from 'lodash'

import { render, screen, mockedStore, cleanup, waitFor } from 'uiSrc/utils/test-utils'
import Csrf from 'uiSrc/components/csrf/Csrf'
import { appCsrfSelector, fetchCsrfToken, initialState } from 'uiSrc/slices/app/csrf'
import { apiService } from 'uiSrc/services'
import { envConfig } from 'uiSrc/env-config'

jest.mock('uiSrc/slices/app/csrf', () => ({
  ...jest.requireActual('uiSrc/slices/app/csrf'),
  appCsrfSelector: jest.fn().mockReturnValue(jest.requireActual('uiSrc/slices/app/csrf').initialState),
}))

jest.mock('uiSrc/services/apiService', () => ({
  get: jest.fn(() => ({ data: { token: 'csrf-token' } })),
}))

let store: typeof mockedStore

describe('Csrf', () => {
  const OLD_ENV_CONFIG = { ...envConfig }

  beforeEach(() => {
    envConfig.RI_CSRF_ENDPOINT = OLD_ENV_CONFIG.RI_CSRF_ENDPOINT
    apiService.get = jest.fn()

    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render children when not loading and no csrf endpoint set', () => {
    (appCsrfSelector as jest.Mock).mockReturnValue({ ...initialState })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )
    expect(apiService.get).not.toBeCalled()
    expect(screen.getByText('children')).toBeInTheDocument()
    expect(store.getActions()).toEqual([])
  })

  it('should render PagePlaceholder when loading', async () => {
    (appCsrfSelector as jest.Mock).mockReturnValue({ ...initialState, loading: true })

    render(<Csrf><div>children</div></Csrf>)

    await waitFor(() => {
      expect(apiService.get).not.toBeCalled()
      expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
    })
  })

  it('should render children when csrf endpoint is present, token is present, and not loading', async () => {
    const csrfEndpoint = 'csrf'
    envConfig.RI_CSRF_ENDPOINT = csrfEndpoint;
    (appCsrfSelector as jest.Mock).mockReturnValue({ ...initialState, csrfEndpoint, token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByText('children')).toBeInTheDocument()
    expect(store.getActions()).toEqual([fetchCsrfToken()])
  })

  it('should render placeholder when csrf endpoint is present, token is present, and loading', () => {
    (appCsrfSelector as jest.Mock).mockReturnValue({
      ...initialState,
      csrfEndpoint: 'http://example.com/csrf',
      token: 'csrf-token',
      loading: true,
    })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should render placeholder when csrf endpoint is present, token is missing, and not loading', () => {
    (appCsrfSelector as jest.Mock).mockReturnValue({
      ...initialState,
      csrfEndpoint: 'http://example.com/csrf',
      token: 'csrf-token',
      loading: true
    })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should not throw and render placeholder when erroring', async () => {
    const csrfEndpoint = 'csrf'
    envConfig.RI_CSRF_ENDPOINT = csrfEndpoint;
    (appCsrfSelector as jest.Mock).mockReturnValue({ ...initialState, csrfEndpoint, token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(store.getActions()).toEqual([fetchCsrfToken()])
    expect(screen.getByText('children')).toBeInTheDocument()
  })
})
