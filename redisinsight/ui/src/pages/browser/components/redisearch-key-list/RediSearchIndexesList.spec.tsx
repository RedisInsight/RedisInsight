import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { useSelector } from 'react-redux'

import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { loadList, redisearchListSelector, setSelectedIndex } from 'uiSrc/slices/browser/redisearch'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import { localStorageService } from 'uiSrc/services'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { changeSearchMode, fetchKeys } from 'uiSrc/slices/browser/keys'
import { BrowserStorageItem } from 'uiSrc/constants'
import RediSearchIndexesList, { Props } from './RediSearchIndexesList'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedProps = mock<Props>()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  fetchKeys: jest.fn(),
  keysSelector: jest.fn().mockReturnValue({
    searchMode: 'Redisearch',
  }),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchListSelector: jest.fn().mockReturnValue({
    data: [],
    loading: false,
    error: '',
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '123',
    connectionType: 'STANDALONE',
    db: 0,
  }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('RediSearchIndexesList', () => {
  beforeEach(() => {
    const state: any = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: any) => any) => callback({
      ...state,
      browser: {
        ...state.browser,
        keys: {
          ...state.browser.keys,
          searchMode: SearchMode.Redisearch,
        },
        redisearch: { ...state.browser.redisearch, loading: false }
      },
      connections: {
        ...state.connections,
        instances: {
          ...state.connections.instances,
          connectedInstance: {
            ...state.connections.instances.connectedInstance,
            modules: [{ name: RedisDefaultModules.Search, }],
          }
        }
      }
    }));

    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      ...state.connections.instances.connectedInstance,
      loading: true,
    }))
  })

  it('should render', () => {
    expect(render(<RediSearchIndexesList {...instance(mockedProps)} />)).toBeTruthy()
    const searchInput = screen.getByTestId('select-search-mode')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render and call changeSearchMode if no RediSearch module', () => {
    localStorageService.set = jest.fn();

    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      host: '123.123.2.2',
      modules: [],
    }))

    expect(render(<RediSearchIndexesList {...instance(mockedProps)} />)).toBeTruthy()

    const expectedActions = [
      changeSearchMode(SearchMode.Pattern),
      changeSearchMode(SearchMode.Pattern),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )

    expect(localStorageService.set).toBeCalledWith(
      BrowserStorageItem.browserSearchMode,
      SearchMode.Pattern,
    )
  })

  it('"loadList" should be called after render', () => {
    const { rerender } = render(
      <RediSearchIndexesList {...instance(mockedProps)} />
    );

    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      host: '123.23.1.1',
      modules: [{ name: RedisDefaultModules.Search, }]
    }))

    rerender(<RediSearchIndexesList {...instance(mockedProps)} />)

    const expectedActions = [
      loadList(),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('"onCreateIndex" should be called after click Create Index', () => {
    const onCreateIndexMock = jest.fn()
    const { queryByText } = render(
      <RediSearchIndexesList {...instance(mockedProps)} onCreateIndex={onCreateIndexMock} />
    )

    fireEvent.click(screen.getByTestId('select-search-mode'))
    fireEvent.click(queryByText('Create Index') || document)

    expect(onCreateIndexMock).toBeCalled()
  })

  it('"setSelectedIndex" and "loadKeys" should be called after select Index', async () => {
    const index = stringToBuffer('idx')
    const fetchKeysMock = jest.fn();

    (fetchKeys as jest.Mock).mockReturnValue(fetchKeysMock);

    (redisearchListSelector as jest.Mock).mockReturnValue({
      data: [index],
      loading: false,
      error: '',
      selectedIndex: null,
    })

    const { queryByText } = render(
      <RediSearchIndexesList {...instance(mockedProps)} />
    );

    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      host: '123.123.1.1',
      modules: [{ name: RedisDefaultModules.Search, }]
    }))

    fireEvent.click(screen.getByTestId('select-search-mode'))
    fireEvent.click(queryByText(bufferToString(index)) || document)

    const expectedActions = [
      setSelectedIndex(index),
      loadList(),
    ]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )

    expect(fetchKeysMock).toBeCalled()
  })

  it('should load indexes after click on refresh', () => {
    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      host: '123.23.1.1',
      modules: [{ name: RedisDefaultModules.Search, }]
    }))

    render(<RediSearchIndexesList {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('refresh-indexes-btn'))

    const expectedActions = [
      ...afterRenderActions,
      loadList(),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
