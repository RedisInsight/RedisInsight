import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import BulkDelete, { Props } from './BulkDelete'

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  bulkActionsDeleteOverviewSelector: jest.fn().mockReturnValue({
    status: 'completed',
    filter: {},
  }),
  bulkActionsDeleteSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
  bulkActionsDeleteSummarySelector: jest.fn().mockReturnValue({
    keys: ['key1', 'key2'],
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockReturnValue({
    filter: '',
    search: '',
    isSearched: false,
    isFiltered: false,
  }),
}))

const mockedProps: Props = {
  onCancel: jest.fn(),
}

describe('BulkDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<BulkDelete {...mockedProps} />)).toBeTruthy()
  })

  it('should display the download button when the bulk delete process is completed', () => {
    render(<BulkDelete {...mockedProps} />)

    const downloadButton = screen.queryByText('Keys deleted')

    expect(downloadButton).toBeInTheDocument()
  })
})
