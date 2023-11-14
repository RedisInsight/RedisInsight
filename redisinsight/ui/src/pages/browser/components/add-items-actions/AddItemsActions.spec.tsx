import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import AddItemsActions, { Props } from './AddItemsActions'

const mockedProps = mock<Props>()

describe('AddItemsActions', () => {
  it('should render', () => {
    expect(render(<AddItemsActions {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not render any buttons with one item', () => {
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={1}
      />
    )
    expect(screen.queryByLabelText(/remove item/i)).toBeNull()
    expect(screen.queryByLabelText(/add new item/i)).toBeNull()
  })

  it('should render clear button', () => {
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={1}
      />
    )
    expect(screen.queryByLabelText(/remove item/i)).toBeNull()
    expect(screen.getByLabelText(/clear item/i)).toBeTruthy()
  })

  it('should render add button', () => {
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={2}
        index={1}
      />
    )
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should call clear function', () => {
    const clearItemValues = jest.fn()
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={1}
        clearItemValues={clearItemValues}
      />
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))
    expect(clearItemValues).toHaveBeenCalledTimes(1)
  })

  it('should call remove function', () => {
    const removeItem = jest.fn()
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={2}
        removeItem={removeItem}
      />
    )
    fireEvent.click(screen.getByLabelText(/remove item/i))
    expect(removeItem).toHaveBeenCalledTimes(1)
  })
})
