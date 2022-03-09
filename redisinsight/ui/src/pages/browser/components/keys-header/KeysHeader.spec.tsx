import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { IKeyListPropTypes } from 'uiSrc/constants/prop-types/keys'
import KeysHeader from './KeysHeader'

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
  } as IKeyListPropTypes,
  loadingState: false,
  selectKey: jest.fn(),
  loadMoreItems: jest.fn(),
  handleAddKeyPanel: jest.fn(),
}

describe('KeyList', () => {
  it('should render', () => {
    expect(render(<KeysHeader {...propsMock} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<KeysHeader {...propsMock} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )
    expect(rows).toHaveLength(3)
  })

  it('should render search properly', () => {
    render(<KeysHeader {...propsMock} />)
    const searchInput = screen.queryByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })
})
