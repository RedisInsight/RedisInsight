import React from 'react'
import { cloneDeep } from 'lodash'

import { render, screen, initialStateDefault, mockedStore, cleanup, waitFor } from 'uiSrc/utils/test-utils'
import Csrf from 'uiSrc/components/csrf/Csrf'
import { appCsrfSelector, fetchCsrfToken, fetchCsrfTokenFail, fetchCsrfTokenSuccess } from 'uiSrc/slices/app/csrf'
import { apiService } from 'uiSrc/services'

jest.mock('uiSrc/slices/app/csrf', () => ({
  ...jest.requireActual('uiSrc/slices/app/csrf'),
  appCsrfSelector: jest.fn(),
}))

jest.mock('uiSrc/services/apiService', () => ({
  get: jest.fn(() => ({ data: { token: 'csrf-token' } })),
}))

const initialSlice = initialStateDefault.app.csrf

const OLD_ENV = { ...process.env }

let mockAppCsrfSelector = jest.mocked(appCsrfSelector)
let store: typeof mockedStore

describe('Csrf', () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV }
    mockAppCsrfSelector = jest.mocked(appCsrfSelector)
    apiService.get = jest.fn()

    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should render children when not loading and no csrf endpoint set', () => {
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )
    expect(apiService.get).not.toBeCalled()
    expect(screen.getByText('children')).toBeInTheDocument()
    expect(store.getActions()).toEqual([])
  })

  it('should render PagePlaceholder when loading', () => {
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice, loading: true })

    render(<Csrf><div>children</div></Csrf>)

    expect(apiService.get).not.toBeCalled()
    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should render children when csrf endpoint is present, token is present, and not loading', async () => {
    const csrfEndpoint = 'csrf'
    process.env.RI_CSRF_ENDPOINT = csrfEndpoint
    const getMock = jest.fn().mockResolvedValue({ data: { token: 'csrf-token' } })
    apiService.get = getMock
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice, csrfEndpoint, token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    await waitFor(() => {
      expect(getMock).toBeCalledWith(csrfEndpoint)
      expect(screen.getByText('children')).toBeInTheDocument()
      expect(store.getActions()).toEqual([fetchCsrfToken(), fetchCsrfTokenSuccess({ token: 'csrf-token' })])
    }, { timeout: 150 })
  })

  it('should render placeholder when csrf endpoint is present, token is present, and loading', () => {
    mockAppCsrfSelector.mockReturnValue({
      ...initialSlice,
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
    mockAppCsrfSelector.mockReturnValue({
      ...initialSlice,
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
    process.env.RI_CSRF_ENDPOINT = csrfEndpoint
    const getMock = jest.fn().mockRejectedValue(new Error('can not get token'))
    apiService.get = getMock
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice, csrfEndpoint, token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    await waitFor(() => {
      expect(getMock).toBeCalledWith(csrfEndpoint)
      expect(store.getActions()).toEqual([fetchCsrfToken(), fetchCsrfTokenFail({ error: 'can not get token' })])
    }, { timeout: 150 })
  })
})
