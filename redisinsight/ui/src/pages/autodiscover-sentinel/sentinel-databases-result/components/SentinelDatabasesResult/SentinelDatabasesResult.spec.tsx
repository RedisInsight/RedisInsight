import { EuiBasicTableColumn } from '@elastic/eui'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import SentinelDatabasesResult, { Props } from './SentinelDatabasesResult'

const mockedProps = mock<Props>()

let mastersMock: ModifiedSentinelMaster[]
let columnsMock: EuiBasicTableColumn<ModifiedSentinelMaster>[]

beforeEach(() => {
  cleanup()

  columnsMock = [
    {
      field: 'name',
      className: 'column_name',
      name: 'Master group',
      dataType: 'string',
      sortable: true,
      width: '170px',
      truncateText: true,
    },
  ]

  mastersMock = [
    {
      name: 'mymaster',
      host: 'localhost',
      port: 6379,
      alias: 'alias',
      numberOfSlaves: 0,
    },
  ]
})

describe('SentinelDatabasesResult', () => {
  it('should render', () => {
    expect(
      render(
        <SentinelDatabasesResult
          {...instance(mockedProps)}
          columns={columnsMock}
          masters={mastersMock}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render search input', () => {
    render(
      <SentinelDatabasesResult
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    expect(screen.getByTestId(/search/i)).toBeTruthy()
  })

  it('should call search and result exist', () => {
    render(
      <SentinelDatabasesResult
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    const searchInput = screen.getByTestId(/search/i)

    const searchQuery = 'mymaster'
    fireEvent.change(searchInput, { target: { value: searchQuery } })
    expect(searchInput).toHaveValue(searchQuery)
    const searchResultRow1 = screen.getByText(searchQuery)
    expect(searchResultRow1).toBeTruthy()
  })

  it("should call search and result doesn't exist", () => {
    render(
      <SentinelDatabasesResult
        {...instance(mockedProps)}
        columns={columnsMock}
        masters={mastersMock}
      />,
    )
    const searchQuery = 'mymaster2'
    const searchInput = screen.getByTestId(/search/i)

    fireEvent.change(searchInput, { target: { value: searchQuery } })
    expect(searchInput).toHaveValue(searchQuery)

    expect(screen.getByText('Not found.')).toBeInTheDocument()
  })
})
