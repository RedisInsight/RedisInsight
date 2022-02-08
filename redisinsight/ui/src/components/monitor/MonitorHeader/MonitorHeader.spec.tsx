import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent, mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { resetMonitorItems, setMonitorInitialState, toggleHideMonitor, toggleMonitor, toggleRunMonitor } from 'uiSrc/slices/cli/monitor'
import MonitorHeader from './MonitorHeader'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MonitorHeader', () => {
  it('should render', () => {
    expect(render(<MonitorHeader />)).toBeTruthy()
  })

  it('should "setMonitorInitialState" action be called after click "close-monitor" button', () => {
    render(<MonitorHeader />)
    fireEvent.click(screen.getByTestId('close-monitor'))

    const expectedActions = [setMonitorInitialState()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should "toggleCliHelper" action be called after click "hide-monitor" button', () => {
    render(<MonitorHeader />)
    fireEvent.click(screen.getByTestId('hide-monitor'))

    const expectedActions = [toggleMonitor(), toggleHideMonitor()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('Should toggle run Monitor after click on the play button', () => {
    render(<MonitorHeader />)

    fireEvent.click(screen.getByTestId('toggle-run-monitor'))

    const expectedActions = [toggleRunMonitor()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('Should clear Monitor items after click on the clear button', () => {
    render(<MonitorHeader />)

    fireEvent.click(screen.getByTestId('clear-monitor'))

    const expectedActions = [resetMonitorItems()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
