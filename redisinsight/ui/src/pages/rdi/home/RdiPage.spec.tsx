import { cloneDeep } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'

import { InitialStateRdiInstances, RdiInstance } from 'uiSrc/slices/interfaces'
import { createInstanceAction, editInstanceAction } from 'uiSrc/slices/rdi/instances'
import { RootState, store } from 'uiSrc/slices/store'
import {
  TelemetryEvent,
  TelemetryPageView,
  sendEventTelemetry,
  sendPageViewTelemetry
} from 'uiSrc/telemetry'
import { act, cleanup, fireEvent, mockedStore, render, screen, waitFor } from 'uiSrc/utils/test-utils'

import RdiPage from './RdiPage'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  editInstanceAction: jest.fn().mockReturnValue({ type: null }),
  createInstanceAction: jest.fn().mockReturnValue({ type: null })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn()
}))

let storeMock: typeof mockedStore
const instancesMock: RdiInstance[] = [
  {
    id: '1',
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date('1/1/2024'),
    version: '1.2',
    username: 'user',
    visible: true
  }
]

const mockState = (rootState: RootState, rdiInstancesState: Partial<InitialStateRdiInstances>) => ({
  ...rootState,
  rdi: {
    ...rootState.rdi,
    instances: {
      ...rootState.rdi.instances,
      ...rdiInstancesState
    }
  }
})

describe('RdiPage', () => {
  beforeEach(() => {
    cleanup()
    storeMock = cloneDeep(mockedStore)
    storeMock.clearActions()

    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback(mockState(state, { loading: false, data: instancesMock })))
  })

  it('should render', () => {
    expect(render(<RdiPage />)).toBeTruthy()
  })

  it('should render instance list when instances are found', () => {
    render(<RdiPage />)

    expect(screen.getByTestId('rdi-instance-list')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-rdi-instance-list')).not.toBeInTheDocument()
  })

  it('should render empty panel when initially loading', () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback(mockState(state, { data: [] })))

    render(<RdiPage />)

    expect(screen.queryByTestId('rdi-instance-list')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-rdi-instance-list')).not.toBeInTheDocument()
  })

  it('should render empty message when no instances are found', () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) =>
      callback(mockState(state, { data: [], loading: false })))

    render(<RdiPage />)

    expect(screen.queryByTestId('rdi-instance-list')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-rdi-instance-list')).toBeInTheDocument()
  })

  it('should open connection form when using header button', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))
    const form = await screen.findByTestId('connection-form')

    expect(form).toBeInTheDocument()
  })

  it('should open connection form when using empty message button', async () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementationOnce((callback: (arg0: RootState) => RootState) =>
      callback(mockState(state, { data: [], loading: false })))

    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: '+ RDI Instance' }))
    const form = await screen.findByTestId('connection-form')

    expect(form).toBeInTheDocument()
  })

  it('should open connection form when using edit button', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit instance' }))
    const form = await screen.findByTestId('connection-form')

    expect(form).toBeInTheDocument()
  })

  it('should close connection form when using cancel button', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))
    await screen.findByTestId('connection-form')

    // close form
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument()
  })

  it('should close connection form when using delete button', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))
    await screen.findByTestId('connection-form')

    // close form
    fireEvent.click(screen.getByRole('button', { name: 'Remove field' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument(), {
      timeout: 1000
    })
  })

  it('should populate connection form with existing values when using edit button', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit instance' }))
    await screen.findByTestId('connection-form')

    expect(screen.getByTestId('connection-form-name-input')).toHaveValue('My first integration')
    expect(screen.getByTestId('connection-form-url-input')).toHaveValue(
      'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345'
    )
    expect(screen.getByTestId('connection-form-username-input')).toHaveValue('user')
    expect(screen.getByTestId('connection-form-password-input')).toHaveValue('')
  })

  it('should open empty connection form with when using header button', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))
    await screen.findByTestId('connection-form')

    expect(screen.getByTestId('connection-form-name-input')).toHaveValue('')
    expect(screen.getByTestId('connection-form-url-input')).toHaveValue('')
    expect(screen.getByTestId('connection-form-username-input')).toHaveValue('')
    expect(screen.getByTestId('connection-form-password-input')).toHaveValue('')
  })

  it('should call edit instance when editInstance is provided', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit instance' }))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), { target: { value: 'name' } })
      fireEvent.change(screen.getByTestId('connection-form-password-input'), { target: { value: 'password2' } })

      // submit form
      fireEvent.click(screen.getByRole('button', { name: 'Add Instance' }))
    })

    expect(editInstanceAction).toBeCalledWith(
      {
        id: '1',
        lastConnection: new Date('1/1/2024'),
        name: 'name',
        password: 'password2',
        url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
        username: 'user',
        version: '1.2',
        visible: true
      },
      expect.any(Function)
    )
  })

  it('should call create instance when editInstance is not provided', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), { target: { value: 'name' } })
      fireEvent.change(screen.getByTestId('connection-form-url-input'), { target: { value: 'url' } })
      fireEvent.change(screen.getByTestId('connection-form-username-input'), { target: { value: 'username' } })
      fireEvent.change(screen.getByTestId('connection-form-password-input'), { target: { value: 'password' } })

      // submit form
      fireEvent.click(screen.getByRole('button', { name: 'Add Instance' }))
    })

    expect(createInstanceAction).toBeCalledWith(
      { name: 'name', url: 'url', username: 'username', password: 'password' },
      expect.any(Function)
    )
  })

  it('should call proper telemetry when connection form is opened', () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByRole('button', { name: 'RDI Instance' }))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CLICKED
    })
  })

  it('should call proper telemetry when instance is submitted', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit instance' }))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-password-input'), { target: { value: 'password3' } })

      // submit form
      fireEvent.click(screen.getByRole('button', { name: 'Add Instance' }))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_SUBMITTED
    })
  })

  it('should call proper telemetry when connection form is closed', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit instance' }))
    await screen.findByTestId('connection-form')

    // close form
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CANCELLED
    })
  })

  it('should call proper sendPageViewTelemetry', () => {
    const sendPageViewTelemetryMock = jest.fn()
    sendPageViewTelemetry.mockImplementation(() => sendPageViewTelemetryMock)

    render(<RdiPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_INSTANCES_PAGE
    })
  })
})
