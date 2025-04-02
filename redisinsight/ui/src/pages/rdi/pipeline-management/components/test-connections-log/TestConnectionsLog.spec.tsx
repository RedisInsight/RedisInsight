import React from 'react'
import { render, screen, fireEvent, within } from 'uiSrc/utils/test-utils'
import { TransformGroupResult } from 'uiSrc/slices/interfaces'

import TestConnectionsLog from './TestConnectionsLog'

describe('TestConnectionsLog', () => {
  it('should render', () => {
    const mockedData: TransformGroupResult = { fail: [], success: [] }
    render(<TestConnectionsLog data={mockedData} />)
  })

  it('should render the correct status when only failed connections exist', () => {
    const mockedData: TransformGroupResult = {
      fail: [{ target: 'localhost:1233', error: 'some error' }],
      success: []
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.getByTestId('failed-connections-closed')).toBeInTheDocument()
    expect(screen.queryByTestId('success-connections-closed')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mixed-connections-closed')).not.toBeInTheDocument()
  })

  it('should render the correct status when only successful connections exist', () => {
    const mockedData: TransformGroupResult = {
      fail: [],
      success: [{ target: 'localhost:1233' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.getByTestId('success-connections-closed')).toBeInTheDocument()
    expect(screen.queryByTestId('failed-connections-closed')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mixed-connections-closed')).not.toBeInTheDocument()
  })

  it('should expand and collapse successful connections', () => {
    const mockedData: TransformGroupResult = {
      fail: [],
      success: [{ target: 'localhost:1233' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    fireEvent.click(
      within(screen.getByTestId('success-connections-closed')).getByRole('button')
    )
    expect(screen.getByTestId('success-connections-open')).toBeInTheDocument()
  })

  it('should display the correct number of successful connections', () => {
    const mockedData: TransformGroupResult = {
      fail: [],
      success: [
        { target: 'localhost:1233' },
        { target: 'localhost:1234' }
      ]
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(
      within(screen.getByTestId('success-connections-closed')).getByTestId('number-of-connections')
    ).toHaveTextContent('2')
  })

  it('should display "Partially connected" when there are both successful and failed connections', () => {
    const mockedData: TransformGroupResult = {
      fail: [{ target: 'localhost:1233', error: 'some error' }],
      success: [{ target: 'localhost:1234' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.getByText('Partially connected:')).toBeInTheDocument()
  })

  it('should expand and collapse the "Mixed" state correctly', () => {
    const mockedData: TransformGroupResult = {
      fail: [{ target: 'localhost:1233', error: 'some error' }],
      success: [{ target: 'localhost:1234' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    fireEvent.click(within(screen.getByTestId('mixed-connections-closed')).getByRole('button'))
    expect(screen.getByTestId('mixed-connections-open')).toBeInTheDocument()
  })

  it('should display the correct number of connections for the "Mixed" state', () => {
    const mockedData: TransformGroupResult = {
      fail: [
        { target: 'localhost:1233', error: 'some error' },
        { target: 'localhost:1234', error: 'timeout' }
      ],
      success: [{ target: 'localhost:1235' }]
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(
      within(screen.getByTestId('mixed-connections-closed')).getByTestId('number-of-connections')
    ).toHaveTextContent('3') // 2 failed + 1 success
  })
})
