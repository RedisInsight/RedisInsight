import React from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import { cleanup, fireEvent, mockedStore, render, screen, act } from 'uiSrc/utils/test-utils'
import { loadInstancesSuccess } from 'uiSrc/slices/instances/instances'
import { RootState, store } from 'uiSrc/slices/store'
import { Instance } from 'uiSrc/slices/interfaces'
import SearchDatabasesList from './SearchDatabasesList'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

let storeMock: typeof mockedStore
const instancesMock: Instance[] = [{
  id: '1',
  name: 'local',
  host: 'localhost',
  port: 6379,
  visible: true,
  modules: [],
  lastConnection: new Date(),
  version: ''
}, {
  id: '2',
  name: 'cloud',
  host: 'cloud',
  port: 6379,
  visible: true,
  modules: [],
  lastConnection: new Date(),
  version: ''
}]

beforeEach(() => {
  cleanup()
  storeMock = cloneDeep(mockedStore)
  storeMock.clearActions()

  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    connections: {
      ...state.connections,
      instances: {
        ...state.connections.instances,
      }
    }
  }))
})

describe('SearchDatabasesList', () => {
  it('should render', () => {
    expect(render(<SearchDatabasesList />)).toBeTruthy()
  })

  it('should call loadInstancesSuccess with after typing', async () => {
    const state: RootState = store.getState();
    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      connections: {
        ...state.connections,
        instances: {
          ...state.connections.instances,
          data: instancesMock
        }
      }
    }))

    const newInstancesMock = [
      ...instancesMock
    ]
    render(<SearchDatabasesList />)

    await act(() => {
      fireEvent.change(
        screen.getByTestId('search-database-list'),
        { target: { value: 'test' } }
      )
    })

    newInstancesMock[0].visible = false
    newInstancesMock[1].visible = false

    const expectedActions = [loadInstancesSuccess(newInstancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })
})
