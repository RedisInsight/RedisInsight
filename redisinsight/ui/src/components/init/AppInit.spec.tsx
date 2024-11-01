import React from 'react'
import { screen } from '@testing-library/react'
import { cloneDeep, set } from 'lodash'
import { initialStateDefault, mockStore, render } from 'uiSrc/utils/test-utils'
import { appInitSelector, STATUS_FAIL, STATUS_INITIAL, STATUS_LOADING, STATUS_SUCCESS, initializeAppAction } from 'uiSrc/slices/app/init'
import AppInit from 'uiSrc/components/init/AppInit'

jest.mock('uiSrc/slices/app/init', () => ({
  ...jest.requireActual('uiSrc/slices/app/init'),
  reducers: {
    ...jest.requireActual('uiSrc/slices/app/init').reducers,
    initializeAppAction: jest.fn(),
  },
  appInitSelector: jest.fn().mockReturnValue(jest.requireActual('uiSrc/slices/app/init').initialState),
  initializeAppAction: jest.fn(),
}))

const initialState = set(
  cloneDeep(initialStateDefault),
  'app.init',
  {
    status: STATUS_INITIAL,
    error: 'Test error',
  },
)
const mockedStore = mockStore(initialState)

beforeEach(() => {
  jest.resetAllMocks()
  mockedStore.clearActions()
})

describe('App Init', () => {
  it('should call initializeAppAction when status is "initial', () => {
    (appInitSelector as jest.Mock).mockReturnValue({
      ...initialState,
      status: STATUS_INITIAL,
      error: undefined,
    })
    const initializeAppActionMock = jest.fn();
    (initializeAppAction as jest.Mock).mockImplementation(() => initializeAppActionMock)
    render(
      <AppInit>
        <div>children</div>
      </AppInit>, {
        store: mockedStore,
      }
    )
    expect(initializeAppAction).toBeCalled()
  })

  it('should render page placeholder when status is "loading"', () => {
    (appInitSelector as jest.Mock).mockReturnValue({
      ...initialState,
      status: STATUS_LOADING,
    })
    render(
      <AppInit>
        <div>children</div>
      </AppInit>, {
        store: mockedStore,
      }
    )
    expect(screen.getByTestId('page-placeholder')).toBeInTheDocument()
  })

  it('should render error page with default error message, when status is "fail"', () => {
    (appInitSelector as jest.Mock).mockReturnValue({
      ...initialState,
      status: STATUS_FAIL,
    })
    render(
      <AppInit>
        <div>children</div>
      </AppInit>, {
        store: mockedStore,
      }
    )
    expect(screen.getByTestId('connectivity-error-message')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong, please try again later')).toBeInTheDocument()
  })

  it('should render error page with custom error message, when status is "fail"', () => {
    (appInitSelector as jest.Mock).mockReturnValue({
      ...initialState,
      status: STATUS_FAIL,
      error: 'Custom error message'
    })
    render(
      <AppInit>
        <div>children</div>
      </AppInit>, {
        store: mockedStore,
      }
    )
    expect(screen.getByTestId('connectivity-error-message')).toBeInTheDocument()
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })
  it('should render children when status is "success"', () => {
    (appInitSelector as jest.Mock).mockReturnValue({
      ...initialState,
      status: STATUS_SUCCESS,
    })
    render(
      <AppInit>
        <div>children</div>
      </AppInit>, {
        store: mockedStore,
      }
    )
    expect(screen.getByText('children')).toBeInTheDocument()
  })
})