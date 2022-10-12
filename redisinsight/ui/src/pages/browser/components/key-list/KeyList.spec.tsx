import React from 'react'
import { render, waitFor } from 'uiSrc/utils/test-utils'
import { KeysStoreData, KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { keysSelector, setLastBatchKeys } from 'uiSrc/slices/browser/keys'
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
  setLastBatchKeys: jest.fn(),
  keysSelector: jest.fn().mockResolvedValue({
    viewType: 'Browser',
    isSearch: false,
    isFiltered: false,
  }),
}))

afterEach(() => {
  setLastBatchKeys.mockRestore()
})

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

  it('should call "setLastBatchKeys" after unmount for Browser view', () => {
    keysSelector.mockImplementation(() => ({
      viewType: KeyViewType.Browser,
      isSearch: false,
      isFiltered: false,
    }))

    const { unmount } = render(<KeyList {...propsMock} />)
    expect(setLastBatchKeys).not.toBeCalled()

    unmount()

    expect(setLastBatchKeys).toBeCalledTimes(1)
  })

  it('should not call "setLastBatchKeys" after unmount for Tree view', () => {
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
    const apiServiceMock = jest.fn().mockResolvedValue([...propsMock.keysState.keys])
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
    const params = { params: { encoding: 'buffer' } }
    const apiServiceMock = jest.fn().mockResolvedValue([...propsMock.keysState.keys])
    apiService.post = apiServiceMock

    const { rerender } = render(<KeyList {...propsMock} keysState={{ ...propsMock.keysState, keys: [] }} />)

    rerender(<KeyList
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        keys: [
          ...propsMock.keysState.keys.map(({ name }) => ({ name })),
          { name: 'key5', size: 100, length: 100 }, // key with info
        ] }}
    />)

    await waitFor(async () => {
      expect(apiServiceMock).toBeCalledTimes(2)

      expect(apiServiceMock.mock.calls[0]).toEqual([
        '/instance//keys/get-metadata',
        { keys: ['key1'] },
        params,
      ])

      expect(apiServiceMock.mock.calls[1]).toEqual([
        '/instance//keys/get-metadata',
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
          ...propsMock.keysState.keys.map(({ name }) => ({ name })),
        ] }}
    />)

    expect(queryAllByTestId(/ttl-loading/).length).toEqual(propsMock.keysState.keys.length)
    expect(queryAllByTestId(/type-loading/).length).toEqual(propsMock.keysState.keys.length)
    expect(queryAllByTestId(/size-loading/).length).toEqual(propsMock.keysState.keys.length)
  })
})
