import React from 'react'
import { render, screen, fireEvent, within } from 'uiSrc/utils/test-utils'
import { ITestConnection, TestConnectionStatus } from 'uiSrc/slices/interfaces'

import TestConnectionsLog from './TestConnectionsLog'

describe('TestConnectionsLog', () => {
  it('should render', () => {
    const mockedData = { fail: [], success: [] }
    render(<TestConnectionsLog data={mockedData} />)
  })

  it('should be a collapsed nav group', () => {
    const mockedData: ITestConnection = {
      fail: [{ index: 0, status: TestConnectionStatus.Fail, endpoint: 'localhost:1233', error: 'some error' }],
      success: []
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.queryByTestId('success-connections-closed')).not.toBeInTheDocument()
    expect(screen.getByTestId('failed-connections-closed')).toBeInTheDocument()
  })

  it('should open and collapse other groups', () => {
    const mockedData: ITestConnection = {
      fail: [],
      success: [{ index: 1, status: TestConnectionStatus.Success, endpoint: 'localhost:1233' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    fireEvent.click(
      within(screen.getByTestId('success-connections-closed')).getByRole('button')
    )
    expect(screen.getByTestId('success-connections-open')).toBeInTheDocument()
  })

  it('should show proper items length', () => {
    const mockedData: ITestConnection = {
      fail: [],
      success: [
        { index: 1, status: TestConnectionStatus.Success, endpoint: 'localhost:1233' },
        { index: 2, status: TestConnectionStatus.Success, endpoint: 'localhost:1233' }
      ]
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(
      within(screen.getByTestId('success-connections-closed')).getByTestId('number-of-connections')
    ).toHaveTextContent('2')
  })
})
