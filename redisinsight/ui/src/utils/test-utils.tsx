// test-utils.js
import React from 'react'
import { cloneDeep, first, map } from 'lodash'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import { render as rtlRender } from '@testing-library/react'

import rootStore, { RootState } from 'uiSrc/slices/store'
import { initialState as initialStateInstances } from 'uiSrc/slices/instances'
import { initialState as initialStateCaCerts } from 'uiSrc/slices/caCerts'
import { initialState as initialStateClientCerts } from 'uiSrc/slices/clientCerts'
import { initialState as initialStateCluster } from 'uiSrc/slices/cluster'
import { initialState as initialStateCloud } from 'uiSrc/slices/cloud'
import { initialState as initialStateSentinel } from 'uiSrc/slices/sentinel'
import { initialState as initialStateKeys } from 'uiSrc/slices/keys'
import { initialState as initialStateString } from 'uiSrc/slices/string'
import { initialState as initialStateZSet } from 'uiSrc/slices/zset'
import { initialState as initialStateSet } from 'uiSrc/slices/set'
import { initialState as initialStateHash } from 'uiSrc/slices/hash'
import { initialState as initialStateList } from 'uiSrc/slices/list'
import { initialState as initialStateRejson } from 'uiSrc/slices/rejson'
import { initialState as initialStateNotifications } from 'uiSrc/slices/app/notifications'
import { initialState as initialStateAppInfo } from 'uiSrc/slices/app/info'
import { initialState as initialStateAppContext } from 'uiSrc/slices/app/context'
import { initialState as initialStateAppRedisCommands } from 'uiSrc/slices/app/redis-commands'
import { initialState as initialStateAppPluginsReducer } from 'uiSrc/slices/app/plugins'
import { initialState as initialStateCliSettings } from 'uiSrc/slices/cli/cli-settings'
import { initialState as initialStateCliOutput } from 'uiSrc/slices/cli/cli-output'
import { initialState as initialStateMonitor } from 'uiSrc/slices/cli/monitor'
import { initialState as initialStateUserSettings } from 'uiSrc/slices/user/user-settings'
import { initialState as initialStateWBResults } from 'uiSrc/slices/workbench/wb-results'
import { initialState as initialStateWBEnablementArea } from 'uiSrc/slices/workbench/wb-enablement-area'
import { initialState as initialStateCreateRedisButtons } from 'uiSrc/slices/content/create-redis-buttons'

interface Options {
  initialState?: RootState;
  store?: typeof rootStore;
  withRouter?: boolean;
  [property: string]: any;
}

// root state
const initialStateDefault: RootState = {
  app: {
    info: cloneDeep(initialStateAppInfo),
    notifications: cloneDeep(initialStateNotifications),
    context: cloneDeep(initialStateAppContext),
    redisCommands: cloneDeep(initialStateAppRedisCommands),
    plugins: cloneDeep(initialStateAppPluginsReducer)
  },
  connections: {
    instances: cloneDeep(initialStateInstances),
    caCerts: cloneDeep(initialStateCaCerts),
    clientCerts: cloneDeep(initialStateClientCerts),
    cluster: cloneDeep(initialStateCluster),
    cloud: cloneDeep(initialStateCloud),
    sentinel: cloneDeep(initialStateSentinel),
  },
  browser: {
    keys: cloneDeep(initialStateKeys),
    string: cloneDeep(initialStateString),
    zset: cloneDeep(initialStateZSet),
    set: cloneDeep(initialStateSet),
    hash: cloneDeep(initialStateHash),
    list: cloneDeep(initialStateList),
    rejson: cloneDeep(initialStateRejson),
  },
  cli: {
    settings: cloneDeep(initialStateCliSettings),
    output: cloneDeep(initialStateCliOutput),
    monitor: cloneDeep(initialStateMonitor),
  },
  user: {
    settings: cloneDeep(initialStateUserSettings),
  },
  workbench: {
    results: cloneDeep(initialStateWBResults),
    enablementArea: cloneDeep(initialStateWBEnablementArea),
  },
  content: {
    createRedisButtons: cloneDeep(initialStateCreateRedisButtons)
  }
}

// mocked store
export const mockStore = configureMockStore([thunk])
export const mockedStore = mockStore(initialStateDefault)

// insert root state to the render Component
const render = (
  ui: JSX.Element,
  { initialState, store = mockedStore, withRouter, ...renderOptions }: Options = initialStateDefault
) => {
  const Wrapper = ({ children }: { children: JSX.Element }) => (
    <Provider store={store}>{children}</Provider>
  )

  const wrapper = !withRouter ? Wrapper : BrowserRouter

  return rtlRender(ui, { wrapper, ...renderOptions })
}

// for render components WithRouter
const renderWithRouter = (ui: JSX.Element, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)

  return render(ui, { wrapper: BrowserRouter })
}

const clearStoreActions = (actions: any[]) => {
  const newActions = map(actions, (action) => {
    const newAction = { ...action }
    if (newAction?.payload) {
      const payload = {
        ...first<any>(newAction.payload),
        key: '',
      } || {}
      newAction.payload = [payload]
    }
    return newAction
  })
  return JSON.stringify(newActions)
}

// mock useHistory
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
  useLocation: () => ({
    pathname: 'pathname',
  }),
  useParams: () => ({
    instanceId: 'instanceId',
  }),
}))

// mock useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  usDispatch: () => ({
    dispatch: jest.fn,
  }),
}))

// mock <AutoSizer />
jest.mock(
  'react-virtualized-auto-sizer',
  () => ({ children }) => children({ height: 600, width: 600 })
)

export const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

export const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

const scrollIntoViewMock = jest.fn()
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

// re-export everything
export * from '@testing-library/react'
// override render method
export { initialStateDefault, render, renderWithRouter, clearStoreActions }
