import React from 'react'
import { cloneDeep } from 'lodash'
import { fireEvent } from '@testing-library/react'
import { cleanup, mockedStore, render, waitFor, screen, clearStoreActions } from 'uiSrc/utils/test-utils'
import { KeysStoreData, KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { deleteSelectedKey, keysSelector, setLastBatchKeys } from 'uiSrc/slices/browser/keys'
import { apiService } from 'uiSrc/services'
import KeyList from './KeyList'

const propsMock = {
  keysState: {
    keys: [
      {
        name: 'key1',
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
        nameString: 'key1'
      },
      {
        name: 'key2',
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
      },
      {
        name: 'key3',
        type: 'hash',
        ttl: -1,
        size: 110,
        length: 100,
      },
    ],
    nextCursor: '0',
    total: 3,
    scanned: 5,
    shardsMeta: {},
    previousResultCount: 1,
    lastRefreshTime: 3
  } as KeysStoreData,
  loading: false,
  selectKey: jest.fn(),
  loadMoreItems: jest.fn(),
  handleAddKeyPanel: jest.fn(),
}

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  // TODO: find solution for mock "setLastBatchKeys" action
  // setLastBatchKeys: jest.fn(),
  keysSelector: jest.fn().mockResolvedValue({
    viewType: 'Browser',
    searchMode: 'Pattern',
    isSearch: false,
    isFiltered: false,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// afterEach(() => {
//   setLastBatchKeys.mockRestore()
// })

describe('KeyList', () => {
  it('should render', () => {
    expect(render(<KeyList {...propsMock} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<KeyList {...propsMock} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )
    expect(rows).toHaveLength(3)
  })

  // TODO: find solution for mock "setLastBatchKeys" action
  it.skip('should call "setLastBatchKeys" after unmount for Browser view', () => {
    keysSelector.mockImplementation(() => ({
      searchMode: SearchMode.Pattern,
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    const { unmount } = render(<KeyList {...propsMock} />)
    expect(setLastBatchKeys).not.toBeCalled()

    unmount()

    expect(setLastBatchKeys).toBeCalledTimes(1)
  })

  // TODO: find solution for mock "setLastBatchKeys" action
  it.skip('should not call "setLastBatchKeys" after unmount for Tree view', () => {
    keysSelector.mockImplementation(() => ({
      viewType: KeyViewType.Tree,
      isSearch: false,
      isFiltered: false,
    }))

    const { unmount } = render(<KeyList {...propsMock} />)
    expect(setLastBatchKeys).not.toBeCalled()

    unmount()

    expect(setLastBatchKeys).not.toBeCalled()
  })

  it('should call apiService.post to get key info', async () => {
    const apiServiceMock = jest.fn().mockResolvedValue(cloneDeep(propsMock.keysState.keys))
    apiService.post = apiServiceMock

    const { rerender } = render(<KeyList {...propsMock} keysState={{ ...propsMock.keysState, keys: [] }} />)

    rerender(<KeyList
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        keys: propsMock.keysState.keys.map(({ name }) => ({ name })) }}
    />)

    await waitFor(async () => {
      expect(apiServiceMock).toBeCalled()
    }, { timeout: 150 })
  })

  it('apiService.post should be called with only keys without info', async () => {
    const controller = new AbortController()
    const params = { params: { encoding: 'buffer' }, signal: controller.signal }
    const apiServiceMock = jest.fn().mockResolvedValue(cloneDeep(propsMock.keysState.keys))
    apiService.post = apiServiceMock

    const { rerender } = render(<KeyList {...propsMock} keysState={{ ...propsMock.keysState, keys: [] }} />)

    rerender(<KeyList
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        keys: [
          ...cloneDeep(propsMock.keysState.keys).map(({ name }) => ({ name })),
          { name: 'key5', size: 100, length: 100 }, // key with info
        ] }}
    />)

    await waitFor(async () => {
      expect(apiServiceMock.mock.calls[0]).toEqual([
        '/databases//keys/get-metadata',
        { keys: ['key1'] },
        params,
      ])

      expect(apiServiceMock.mock.calls[1]).toEqual([
        '/databases//keys/get-metadata',
        { keys: ['key1', 'key2', 'key3'] },
        params,
      ])
    }, { timeout: 150 })
  })

  it('key info loadings (type, ttl, size) should be in the DOM if keys do not have info', async () => {
    const { rerender, queryAllByTestId } = render(
      <KeyList {...propsMock} keysState={{ ...propsMock.keysState, keys: [] }} />
    )

    rerender(<KeyList
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        keys: [
          ...cloneDeep(propsMock).keysState.keys.map(({ name }) => ({ name })),
        ] }}
    />)

    expect(queryAllByTestId(/ttl-loading/).length).toEqual(propsMock.keysState.keys.length)
    expect(queryAllByTestId(/type-loading/).length).toEqual(propsMock.keysState.keys.length)
    expect(queryAllByTestId(/size-loading/).length).toEqual(propsMock.keysState.keys.length)
  })

  it('should call proper action after click on delete', async () => {
    const { container } = render(<KeyList {...propsMock} />)

    fireEvent.mouseOver(container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )[0])

    fireEvent.click(screen.getByTestId('delete-key-btn-key1'))
    fireEvent.click(screen.getByTestId('submit-delete-key'))

    const expectedActions = [
      deleteSelectedKey()
    ]
    expect(clearStoreActions(store.getActions().slice(-1))).toEqual(clearStoreActions(expectedActions))
  })
})
