import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import TestConnectionsPanel, { Props } from './TestConnectionsPanel'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/rdi/testConnections', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/testConnections'),
  rdiTestConnectionsSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

describe('TestConnectionsPanel', () => {
  it('should render', () => {
    render(<TestConnectionsPanel {...instance(mockedProps)} />)
  })

  it('should call onClose', () => {
    const mockOnClose = jest.fn()
    render(<TestConnectionsPanel onClose={mockOnClose} />)

    fireEvent.click(screen.getByTestId('close-test-connections-btn'))

    expect(mockOnClose).toBeCalled()
  })

  it('should render loading', () => {
    const rdiTestConnectionsSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    });
    (rdiTestConnectionsSelector as jest.Mock).mockImplementation(rdiTestConnectionsSelectorMock)

    render(<TestConnectionsPanel {...instance(mockedProps)} />)

    expect(screen.getByTestId('test-connections-loader')).toBeInTheDocument()
  })
})
