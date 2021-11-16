import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { instance, mock } from 'ts-mockito'
import AddItemsActions from './AddItemsActions'
import { Props } from '../key-details-add-items/add-zset-members/AddZsetMembers'

const mockedProps = mock<Props>()
const mouseEvent = () => (
  new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })
)

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
        removeCanClear
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
        removeCanClear
      />
    )
    fireEvent(
      screen.getByLabelText(/clear item/i),
      mouseEvent()
    )
    expect(clearItemValues).toHaveBeenCalledTimes(1)
  })

  it('should call remove function', () => {
    const removeItem = jest.fn()
    render(
      <AddItemsActions
        {...instance(mockedProps)}
        length={2}
        removeItem={removeItem}
        removeCanClear
      />
    )
    fireEvent(
      screen.getByLabelText(/remove item/i),
      mouseEvent()
    )
    expect(removeItem).toHaveBeenCalledTimes(1)
  })
})
