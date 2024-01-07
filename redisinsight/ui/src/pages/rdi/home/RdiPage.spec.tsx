import { cloneDeep } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { instance, mock } from 'ts-mockito'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { RootState, store } from 'uiSrc/slices/store'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'

import RdiPage, { Props } from './RdiPage'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

let storeMock: typeof mockedStore
const instancesMock: RdiInstance[] = [
  {
    id: '1',
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date(),
    version: '1.2',
    visible: true
  }
]

const mockedProps = mock<Props>()

describe('RdiPage', () => {
  beforeEach(() => {
    cleanup()
    storeMock = cloneDeep(mockedStore)
    storeMock.clearActions()

    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        rdi: {
          ...state.rdi,
          instances: {
            ...state.rdi.instances,
            data: instancesMock
          }
        }
      }))
  })

  it('should render', () => {
    expect(render(<RdiPage {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render instance list when instances are found', () => {
    render(<RdiPage {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-instance-list')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-rdi-instance-list')).not.toBeInTheDocument()
  })

  it('should render empty panel when initially loading', () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        rdi: {
          ...state.rdi,
          instances: {
            ...state.rdi.instances,
            data: [],
            loading: true
          }
        }
      }))

    render(<RdiPage {...instance(mockedProps)} />)

    expect(screen.queryByTestId('rdi-instance-list')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-rdi-instance-list')).not.toBeInTheDocument()
  })

  it('should render empty message when no instances are found', () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        rdi: {
          ...state.rdi,
          instances: {
            ...state.rdi.instances,
            data: [],
            loading: false
          }
        }
      }))

    render(<RdiPage {...instance(mockedProps)} />)

    expect(screen.queryByTestId('rdi-instance-list')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-rdi-instance-list')).toBeInTheDocument()
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn()
    sendPageViewTelemetry.mockImplementation(() => sendPageViewTelemetryMock)

    render(<RdiPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_INSTANCES_PAGE,
    })
  })
})
