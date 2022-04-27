import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
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
})
