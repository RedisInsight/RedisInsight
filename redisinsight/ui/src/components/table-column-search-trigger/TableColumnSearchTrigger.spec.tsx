import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import TableColumnSearchTrigger, { Props } from './TableColumnSearchTrigger'

const mockedProps = mock<Props>()

describe('TableColumnSearchTrigger', () => {
  it('should render', () => {
    expect(
      render(<TableColumnSearchTrigger {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should change search value', () => {
    render(<TableColumnSearchTrigger {...instance(mockedProps)} isOpen />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, {
      target: { value: '*1*' },
    })
    expect(searchInput).toHaveValue('*1*')
  })
})
