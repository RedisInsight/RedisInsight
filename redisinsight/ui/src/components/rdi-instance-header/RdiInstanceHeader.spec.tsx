import { cloneDeep } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import RdiInstanceHeader from './RdiInstanceHeader'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name',
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('RdiInstanceHeader', () => {
  it('should render', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<RdiInstanceHeader />)

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/integrate')
  })

  it('should render proper instance name', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()

    expect(screen.getByTestId('rdi-instance-name')).toHaveTextContent('name')
  })
})
