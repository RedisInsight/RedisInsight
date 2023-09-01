import React from 'react'
import { cloneDeep } from 'lodash'
import { fireEvent, screen, render, mockedStore, cleanup } from 'uiSrc/utils/test-utils'
import { appActionBarSelector, setActionBarInitialState, initialState } from 'uiSrc/slices/app/actionBar'
import { ActionBarStatus } from 'uiSrc/slices/interfaces'
import GlobalActionBar from './GlobalActionBar'

jest.mock('uiSrc/slices/app/actionBar', () => ({
  ...jest.requireActual('uiSrc/slices/app/actionBar'),
  appActionBarSelector: jest.fn().mockReturnValue(() => ({
    status: 'close',
    text: '',
    actions: []
  })),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('GlobalActionBar', () => {
  it('should render', () => {
    expect(render(<GlobalActionBar />)).toBeTruthy()
  })

  it('click on Close btn call "setActionBarInitialState"', () => {
    (appActionBarSelector as jest.Mock).mockImplementation(() => ({
      ...initialState,
      status: ActionBarStatus.Success,
    }))

    render(<GlobalActionBar />)

    fireEvent.click(screen.getByTestId('close-global-action-bar'))

    const expectedActions = [setActionBarInitialState()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('action buttons should in the document', () => {
    (appActionBarSelector as jest.Mock).mockImplementation(() => ({
      ...initialState,
      status: ActionBarStatus.Success,
      actions: [
        { label: '123', onClick: () => {} },
        { label: '321', onClick: () => {} }
      ]
    }))

    const { queryByTestId } = render(<GlobalActionBar />)

    expect(queryByTestId('global-action-button-123')).toBeInTheDocument()
    expect(queryByTestId('global-action-button-321')).toBeInTheDocument()
  })
})
