import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import BulkDelete, { Props } from './BulkDelete'

const mockedProps = {
  ...mock<Props>(),
}

describe('BulkDelete', () => {
  it('should render', () => {
    expect(render(<BulkDelete {...mockedProps} />)).toBeTruthy()
  })

  it('should call onCancel prop when click on Cancel btn', () => {
    const mockOnCancel = jest.fn()
    render(<BulkDelete {...mockedProps} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(mockOnCancel).toBeCalled()
  })
})
