import React from 'react'
import { cloneDeep } from 'lodash'

import { toggleCli } from 'uiSrc/slices/cli/cli-settings'
import { fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import BottomGroupMinimized from './BottomGroupMinimized'

describe('CliHeaderMinimized', () => {
  it('should render', () => {
    expect(
      render(<BottomGroupMinimized />)
    ).toBeTruthy()
  })

  it('should "toggleCli" & "clearSearchingCommand" actions be called after click "expand-cli" button', () => {
    const store = cloneDeep(mockedStore)

    render(<BottomGroupMinimized />)
    fireEvent.click(screen.getByTestId('expand-cli'))

    const expectedActions = [toggleCli()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
