import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { KeysStoreData, KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { keysSelector, setLastBatchKeys } from 'uiSrc/slices/browser/keys'
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
})
