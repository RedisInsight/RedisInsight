import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import PopoverDelete, { Props } from './PopoverDelete'

const mockedProps = mock<Props>()

describe('PopoverDelete', () => {
  it('should render', () => {
    expect(render(<PopoverDelete {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call showPopover on delete', () => {
    const showPopover = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        keyName="key"
        showPopover={showPopover}
      />
    )
    fireEvent(
      screen.getByLabelText(/remove field/i),
      new MouseEvent('click', { bubbles: true })
    )

    expect(showPopover).toBeCalledTimes(1)
  })

  it('should call handleDeleteItem on delete', () => {
    const handleDeleteItem = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        suffix="_"
        deleting="name_"
        keyName="key"
        handleDeleteItem={handleDeleteItem}
      />
    )

    const deleteBtn = screen.getByTestId('remove')
    fireEvent(
      deleteBtn,
      new MouseEvent('click', { bubbles: true })
    )
    expect(handleDeleteItem).toBeCalledTimes(1)
  })
})
