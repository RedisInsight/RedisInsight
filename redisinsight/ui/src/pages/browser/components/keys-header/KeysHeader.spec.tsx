import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeysStoreData, KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import * as keysSlice from 'uiSrc/slices/browser/keys'
import { BrowserColumns } from 'uiSrc/constants'
import KeysHeader from './KeysHeader'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn()
}))

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
  sizes: {},
  loadKeys: jest.fn(),
  loadMoreItems: jest.fn(),
  handleAddKeyPanel: jest.fn(),
  nextCursor: '0',
  isSearched: false,
  handleScanMoreClick: jest.fn(),
}

describe('KeysHeader', () => {
  beforeEach(() => {
    (keysSlice.keysSelector as jest.Mock).mockReturnValue(keysSlice.initialState)
  })

  it('should render', () => {
    expect(render(<KeysHeader {...propsMock} />)).toBeTruthy()
  })

  it('should render key view type switcher properly', () => {
    render(<KeysHeader {...propsMock} />)

    const keyViewTypeSwitcherInput = screen.queryByTestId('view-type-switcher')
    expect(keyViewTypeSwitcherInput).toBeInTheDocument()
  })

  it('should render Scan more button if total => keys.length', () => {
    (keysSlice.keysSelector as jest.Mock).mockReturnValue({
      searchMode: SearchMode.Redisearch,
      viewType: KeyViewType.Tree,
      isSearch: false,
      isFiltered: false,
      shownColumns: [BrowserColumns.TTL, BrowserColumns.Size],
    })

    const { queryByTestId } = render(<KeysHeader
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        maxResults: 200,
        total: 200,
      }}
      nextCursor="3"
    />)

    expect(queryByTestId('scan-more')).toBeInTheDocument()
  })

  it('should not render Scan more button for if searchMode = "Redisearch" and keys.length > maxResults', () => {
    const { queryByTestId } = render(<KeysHeader
      {...propsMock}
      keysState={{
        ...propsMock.keysState,
        maxResults: propsMock.keysState.keys.length - 1,
        total: 200,
        nextCursor: '3',
      }}
    />)

    expect(queryByTestId('scan-more')).not.toBeInTheDocument()
  })
})
