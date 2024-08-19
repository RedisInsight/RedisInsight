import React from 'react'
import { cloneDeep } from 'lodash'

import { render, screen, initialStateDefault, mockedStore, cleanup } from 'uiSrc/utils/test-utils'
import Csrf from 'uiSrc/components/csrf/Csrf'
import { appCsrfSelector, fetchCsrfToken, fetchCsrfTokenSuccess, getCsrfEndpoint } from 'uiSrc/slices/app/csrf'

jest.mock('uiSrc/slices/app/csrf', () => ({
  ...jest.requireActual('uiSrc/slices/app/csrf'),
  appCsrfSelector: jest.fn(),
}))

jest.mock('uiSrc/services', () => ({
  get: jest.fn(() => ({ data: { token: 'csrf-token' } }))
}))

const initialSlice = initialStateDefault.app.csrf

let mockAppCsrfSelector = jest.mocked(appCsrfSelector)
// let mockGetCsrfEndpoint = jest.mocked(getCsrfEndpoint)
let store: typeof mockedStore

describe('Csrf', () => {
  beforeEach(() => {
    mockAppCsrfSelector = jest.mocked(appCsrfSelector)

    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render children when not loading and no csrf endpoint set', () => {
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByText('children')).toBeInTheDocument()
    expect(store.getActions()).toEqual([])
  })

  it('should render PagePlaceholder when loading', () => {
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice, loading: true })

    render(<Csrf><div>children</div></Csrf>)

    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should render children when csrf endpoint is present, token is present, and not loading', () => {
    mockAppCsrfSelector.mockReturnValue({ ...initialSlice, csrfEndpoint: 'http://example.com/csrf', token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByText('children')).toBeInTheDocument()
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
})
