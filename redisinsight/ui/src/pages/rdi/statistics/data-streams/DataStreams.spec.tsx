import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import DataStreams from './DataStreams'

const mockedProps = {
  data: {
    stream1: {
      total: 11,
      pending: 5,
      inserted: 3,
      updated: 2,
      deleted: 1,
      filtered: 0,
      rejected: 0,
      deduplicated: 0,
      lastArrival: '2022-01-01'
    },
    stream2: {
      total: 20,
      pending: 10,
      inserted: 6,
      updated: 4,
      deleted: 2,
      filtered: 0,
      rejected: 0,
      deduplicated: 0,
      lastArrival: '2022-01-02'
    }
  },
  loading: false,
  onRefresh: jest.fn(),
  onRefreshClicked: jest.fn(),
  onChangeAutoRefresh: jest.fn()
}

describe('DataStreams', () => {
  it('renders the data streams table', () => {
    render(<DataStreams {...mockedProps} />)

    // Assert that the table is rendered
    expect(screen.getByTestId('data-streams-table')).toBeInTheDocument()

    // Assert that the table columns are rendered
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(10) // 10 columns

    // Assert that the data rows are rendered
    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(3) // 2 data rows + 1 header row
  })
})
