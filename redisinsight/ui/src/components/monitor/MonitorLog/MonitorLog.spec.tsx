import { cloneDeep } from 'lodash'
import React from 'react'
import { resetProfiler, stopMonitor } from 'uiSrc/slices/cli/monitor'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import MonitorLog from './MonitorLog'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

/**
 * MonitorLog tests
 *
 * @group unit
 */
describe('MonitorLog', () => {
  it('should render', () => {
    expect(render(<MonitorLog />)).toBeTruthy()
  })

  it('should call proper actions on click reset profiler', () => {
    render(<MonitorLog />)
    fireEvent.click(screen.getByTestId('reset-profiler-btn'))

    const expectedActions = [stopMonitor(), resetProfiler()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
