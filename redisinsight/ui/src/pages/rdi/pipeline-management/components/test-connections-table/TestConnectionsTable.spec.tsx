import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import TestConnectionsTable from './TestConnectionsTable'

describe('TestConnectionsTable', () => {
  it('should render', () => {
    render(<TestConnectionsTable data={[{ target: 'localhost:8080' }]} />)
  })

  it('should not render table for empty data', () => {
    render(<TestConnectionsTable data={[]} />)

    expect(screen.queryByTestId('connections-log-table')).not.toBeInTheDocument()
  })

  it('should render table data with success messages', () => {
    render(
      <TestConnectionsTable data={[
        { target: 'localhost:8080' },
        { target: 'localhost:8081' },
      ]}
      />
    )

    expect(screen.getByTestId('table-target-localhost:8080')).toHaveTextContent('localhost:8080')
    expect(screen.getByTestId('table-target-localhost:8081')).toHaveTextContent('localhost:8081')
    expect(screen.getByTestId('table-result-localhost:8080')).toHaveTextContent('Successful')
    expect(screen.getByTestId('table-result-localhost:8081')).toHaveTextContent('Successful')
  })

  it('should render table data with error messages', () => {
    render(
      <TestConnectionsTable data={[
        { target: 'localhost:8080', error: 'error' },
      ]}
      />
    )
    expect(screen.getByTestId('table-result-localhost:8080')).toHaveTextContent('error')
  })
})
