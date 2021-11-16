import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'

import { toggleCli, clearSearchingCommand } from 'uiSrc/slices/cli/cli-settings'
import { fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import CliHeaderMinimized, { Props } from './CliHeaderMinimized'

const mockedProps = mock<Props>()

describe('CliHeaderMinimized', () => {
  it('should render', () => {
    expect(
      render(<CliHeaderMinimized {...instance(mockedProps)} />)
    ).toBeTruthy()
  })

  it('should "toggleCli" & "clearSearchingCommand" actions be called after click "expand-cli" button', () => {
    const store = cloneDeep(mockedStore)

    render(<CliHeaderMinimized {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('expand-cli'))

    const expectedActions = [toggleCli(), clearSearchingCommand()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
