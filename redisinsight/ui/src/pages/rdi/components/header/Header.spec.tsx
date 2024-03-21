import { cloneDeep } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import Header from './Header'

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

const mockedProps = {
  actions: <div>actions</div>
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('Header', () => {
  it('should render', () => {
    expect(render(<Header {...mockedProps} />)).toBeTruthy()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<Header {...mockedProps} />)

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/integrate')
  })

  it('should render proper instance name', () => {
    expect(render(<Header {...mockedProps} />)).toBeTruthy()

    expect(screen.getByTestId('rdi-instance-name')).toHaveTextContent('name')
  })
})
