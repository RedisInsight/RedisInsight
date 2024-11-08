import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import JsonErrorContent, { Props } from './JsonErrorContent'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('JsonErrorContent', () => {
  it('should render', () => {
    expect(render(<JsonErrorContent {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should display the JSON support message', () => {
    render(<JsonErrorContent {...instance(mockedProps)} />)
    expect(screen.getByText(/This database does not support the JSON data structure/)).toBeInTheDocument()
  })

  it('should call onClose when clicking Ok button', () => {
    const onClose = jest.fn()
    render(<JsonErrorContent onClose={onClose} />)
    
    screen.getByText('Ok').click()
    expect(onClose).toHaveBeenCalled()
  })

  it('should render links to documentation', () => {
    render(<JsonErrorContent {...instance(mockedProps)} />)
    
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://redis.io/docs/stack/json/about/')
    expect(links[1]).toHaveAttribute('href', 'https://redis.io/docs/stack/json/about/')
  })
})
