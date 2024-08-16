import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { render, screen, initialStateDefault } from 'uiSrc/utils/test-utils'
import Csrf from 'uiSrc/components/csrf/Csrf'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

const mockDispatch = jest.fn()
const useDispatchMock = useDispatch as jest.Mock
const useSelectorMock = useSelector as jest.Mock

describe('Csrf', () => {
  beforeEach(() => {
    jest.resetModules()
    useDispatchMock.mockReturnValue(mockDispatch)
    useSelectorMock.mockReturnValue(initialStateDefault.app.csrf)
    useDispatch
  })

  it('should render children when not loading and no csrf endpoint set', () => {
    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(mockDispatch).toHaveBeenCalled()
    expect(screen.getByText('children')).toBeInTheDocument()
  })

  it('should render PagePlaceholder when loading', () => {
    useSelectorMock.mockReturnValueOnce({ loading: true })

    render(<Csrf><div>children</div></Csrf>)

    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should render children when csrf endpoint is present, token is present, and not loading', () => {
    useSelectorMock.mockReturnValueOnce({ csrfEndpoint: 'http://example.com/csrf', token: 'csrf-token' })

    render(
      <Csrf>
        <div>children</div>
      </Csrf>
    )

    expect(screen.getByText('children')).toBeInTheDocument()
  })

  it('should render placeholder when csrf endpoint is present, token is present, and loading', () => {
    useSelectorMock.mockReturnValueOnce({
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

  it('should render placeholder when csrf endpoint is present, token is missing, and not loading', () => {
    useSelectorMock.mockReturnValueOnce({
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
