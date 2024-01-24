import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { EditItemFieldAction, Props } from './EditItemFieldAction'

const mockedProps = mock<Props>()

describe('EditItemFieldAction Component', () => {
  it('renders correctly with provided props (object)', () => {
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      type="object"
    />)

    expect(screen.getByTestId('edit-object-btn')).toBeInTheDocument()
  })

  it('renders correctly with provided props (array)', () => {
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      type="array"
    />)

    expect(screen.getByTestId('btn-edit-field')).toBeInTheDocument()
  })

  it('triggers onClickEditEntireItem when the edit button is clicked', () => {
    const onClickEditEntireItem = jest.fn()
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      type="object"
      onClickEditEntireItem={onClickEditEntireItem}
    />)

    fireEvent.click(screen.getByTestId('edit-object-btn'))
    expect(onClickEditEntireItem).toHaveBeenCalled()
  })

  it('triggers setDeleting when the delete button is clicked', async () => {
    const setDeleting = jest.fn()
    const handleSubmitRemoveKey = jest.fn()
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      type="array"
      setDeleting={setDeleting}
      handleSubmitRemoveKey={handleSubmitRemoveKey}
    />)

    await waitFor(() => screen.getByTestId('remove-icon'))

    fireEvent.click(screen.getByTestId('remove-icon'))

    expect(setDeleting).toHaveBeenCalled()
  })
})
