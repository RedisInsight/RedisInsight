import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen, waitForEuiPopoverVisible, act } from 'uiSrc/utils/test-utils'
import EditItemFieldAction, { Props } from './EditItemFieldAction'

const mockedProps = mock<Props>()

describe('EditItemFieldAction Component', () => {
  it('renders correctly', () => {
    render(<EditItemFieldAction
      {...instance(mockedProps)}
    />)

    expect(screen.getByTestId('edit-json-field')).toBeInTheDocument()
  })

  it('triggers onClickEditEntireItem when the edit button is clicked', () => {
    const onClickEditEntireItem = jest.fn()
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      onClickEditEntireItem={onClickEditEntireItem}
    />)

    fireEvent.click(screen.getByTestId('edit-json-field'))
    expect(onClickEditEntireItem).toHaveBeenCalled()
  })

  it('triggers handleSubmitRemoveKey when the delete button is clicked', async () => {
    const handleSubmitRemoveKey = jest.fn()
    render(<EditItemFieldAction
      {...instance(mockedProps)}
      keyName="a"
      handleSubmitRemoveKey={handleSubmitRemoveKey}
    />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-json-field-icon'))
    })

    await waitForEuiPopoverVisible()

    fireEvent.click(screen.getByTestId('remove-json-field'))

    expect(handleSubmitRemoveKey).toHaveBeenCalled()
  })
})
