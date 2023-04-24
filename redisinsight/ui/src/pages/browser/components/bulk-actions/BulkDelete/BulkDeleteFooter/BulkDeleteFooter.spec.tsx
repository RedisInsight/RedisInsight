import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import BulkDeleteFooter, { Props } from './BulkDeleteFooter'

const mockedProps = {
  ...mock<Props>(),
}

describe('BulkDeleteFooter', () => {
  it('should render', () => {
    expect(render(<BulkDeleteFooter {...mockedProps} />)).toBeTruthy()
  })

  it('should call onCancel prop when click on Cancel btn', () => {
    const mockOnCancel = jest.fn()
    render(<BulkDeleteFooter {...mockedProps} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(mockOnCancel).toBeCalled()
  })
})
