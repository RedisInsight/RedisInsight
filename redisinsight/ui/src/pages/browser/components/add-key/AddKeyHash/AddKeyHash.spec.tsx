import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { instance, mock } from 'ts-mockito'
import AddKeyHash, { Props } from './AddKeyHash'

const mockedProps = mock<Props>()

/**
 * AddKeyHash tests
 *
 * @group unit
 */
describe('AddKeyHash', () => {
  it('should render', () => {
    expect(render(<AddKeyHash {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set field name properly', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('field-name')
    fireEvent.change(
      fieldName,
      { target: { value: 'field name' } }
    )
    expect(fieldName).toHaveValue('field name')
  })

  it('should set field value properly', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('field-value')
    fireEvent.change(
      fieldName,
      { target: { value: '123' } }
    )
    expect(fieldName).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more field name & value inputs after click add item', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getAllByTestId('field-name')).toHaveLength(2)
    expect(screen.getAllByTestId('field-value')).toHaveLength(2)
  })

  it('should clear fieldName & fieldValue after click clear button', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('field-name')
    const fieldValue = screen.getByTestId('field-value')
    fireEvent.change(
      fieldName,
      { target: { value: 'name' } }
    )
    fireEvent.change(
      fieldValue,
      { target: { value: 'val' } }
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(fieldName).toHaveValue('')
    expect(fieldValue).toHaveValue('')
  })
})
