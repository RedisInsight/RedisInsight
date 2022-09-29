import React from 'react'
import { cloneDeep } from 'lodash'

import { toggleCli, toggleCliHelper } from 'uiSrc/slices/cli/cli-settings'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import BottomGroupMinimized from './BottomGroupMinimized'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('BottomGroupMinimized', () => {
  it('should render', () => {
    expect(
      render(<BottomGroupMinimized />)
    ).toBeTruthy()
  })

  it('should "toggleCli" action be called after click "expand-cli" button', () => {
    render(<BottomGroupMinimized />)
    fireEvent.click(screen.getByTestId('expand-cli'))

    const expectedActions = [toggleCli()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should "toggleCliHelper" action be called after click "expand-command-helper" button', () => {
    render(<BottomGroupMinimized />)
    fireEvent.click(screen.getByTestId('expand-command-helper'))

    const expectedActions = [toggleCliHelper()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
