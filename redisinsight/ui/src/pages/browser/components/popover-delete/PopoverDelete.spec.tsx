import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import PopoverDelete, { Props } from './PopoverDelete'

const mockedProps = mock<Props>()

/**
 * PopoverDelete tests
 *
 * @group unit
 */
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
        showPopover={showPopover}
      />
    )
    fireEvent.click(screen.getByLabelText(/remove field/i))

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
        handleDeleteItem={handleDeleteItem}
      />
    )

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
  })
})
