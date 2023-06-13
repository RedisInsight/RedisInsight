import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { getTriggeredFunctionsList, triggeredFunctionsSelector } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import LibrariesPage from './LibrariesPage'

jest.mock('uiSrc/slices/triggeredFunctions/triggeredFunctions', () => ({
  ...jest.requireActual('uiSrc/slices/triggeredFunctions/triggeredFunctions'),
  triggeredFunctionsSelector: jest.fn().mockReturnValue({
    loading: false,
    libraries: null
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedLibraries = [
  {
    name: 'lib1',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib2',
    user: 'user1',
    totalFunctions: 2,
    pendingJobs: 1
  },
  {
    name: 'lib3',
    user: 'user2',
    totalFunctions: 2,
    pendingJobs: 1
  }
]

describe('LibrariesPage', () => {
  it('should render', () => {
    expect(render(<LibrariesPage />)).toBeTruthy()
  })

  it('should fetch list of libraries', () => {
    render(<LibrariesPage />)

    const expectedActions = [getTriggeredFunctionsList()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render message when no libraries uploaded', () => {
    (triggeredFunctionsSelector as jest.Mock).mockReturnValueOnce({
      libraries: [],
      loading: false
    })
    render(<LibrariesPage />)

    expect(screen.getByTestId('triggered-functions-welcome')).toBeInTheDocument()
  })

  it('should render libraries list', () => {
    (triggeredFunctionsSelector as jest.Mock).mockReturnValueOnce({
      libraries: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    expect(screen.queryByTestId('triggered-functions-welcome')).not.toBeInTheDocument()
    expect(screen.getByTestId('libraries-list-table')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(3)
  })

  it('should filter libraries list', () => {
    (triggeredFunctionsSelector as jest.Mock).mockReturnValueOnce({
      libraries: mockedLibraries,
      loading: false
    })
    render(<LibrariesPage />)

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: 'lib1' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(1)
    expect(screen.getByTestId('row-lib1')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: 'user1' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(2)
    expect(screen.getByTestId('row-lib1')).toBeInTheDocument()
    expect(screen.getByTestId('row-lib2')).toBeInTheDocument()

    fireEvent.change(
      screen.getByTestId('search-libraries-list'),
      { target: { value: '' } }
    )
    expect(screen.queryAllByTestId(/^row-/).length).toEqual(3)
  })
})
