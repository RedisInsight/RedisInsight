import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent, mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { toggleCliHelper } from 'uiSrc/slices/cli/cli-settings'
import CommandHelperHeader from './CommandHelperHeader'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CommandHelperHeader', () => {
  it('should render', () => {
    expect(render(<CommandHelperHeader />)).toBeTruthy()
  })

  it('should "toggleCli" action be called after click "close-command-helper" button', () => {
    render(<CommandHelperHeader />)
    fireEvent.click(screen.getByTestId('close-command-helper'))

    const expectedActions = [toggleCliHelper()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
