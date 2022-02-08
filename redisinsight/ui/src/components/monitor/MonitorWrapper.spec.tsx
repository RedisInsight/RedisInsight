import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import MonitorWrapper from './MonitorWrapper'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MonitorWrapper', () => {
  it('should render', () => {
    expect(render(<MonitorWrapper />)).toBeTruthy()
  })

  it('MonitorWrapper should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitorWrapper = screen.queryByTestId('monitor-container')

    expect(monitorWrapper).toBeInTheDocument()
  })

  it('MonitorWrapper should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitor = screen.queryByTestId('monitor')

    expect(monitor).toBeInTheDocument()
  })

  it('MonitorHeader should be in the Document', () => {
    render(<MonitorWrapper />)

    const monitorHeader = screen.queryByTestId('monitor-header')

    expect(monitorHeader).toBeInTheDocument()
  })
})
