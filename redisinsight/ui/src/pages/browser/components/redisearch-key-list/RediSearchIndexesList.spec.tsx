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
import { loadKeys, loadList, redisearchListSelector, setSelectedIndex } from 'uiSrc/slices/browser/redisearch'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
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

describe('RediSearchIndexesList', () => {
  beforeEach(() => {
    const state: any = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: any) => any) => callback({
      ...state,
      browser: {
        ...state.browser,
        keys: {
          ...state.browser.keys,
          searchMode: 'Redisearch',
        },
        redisearch: { ...state.browser.redisearch, loading: false }
      }
    }))
  })

  it('should render', () => {
    expect(render(<RediSearchIndexesList {...instance(mockedProps)} />)).toBeTruthy()
    const searchInput = screen.getByTestId('select-search-mode')
    expect(searchInput).toBeInTheDocument()
  })

  it('"loadList" should be called after render', () => {
    render(
      <RediSearchIndexesList {...instance(mockedProps)} />
    )

    const expectedActions = [
      loadList()
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

  it('"setSelectedIndex" and "loadKeys" should be called after select Index', () => {
    const index = stringToBuffer('idx');

    (redisearchListSelector as jest.Mock).mockReturnValue({
      data: [index],
      loading: false,
      error: '',
    })

    const { queryByText } = render(
      <RediSearchIndexesList {...instance(mockedProps)} />
    )

    fireEvent.click(screen.getByTestId('select-search-mode'))
    fireEvent.click(queryByText(bufferToString(index)) || document)

    const expectedActions = [
      loadList(),
      setSelectedIndex(index),
      loadKeys(),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
