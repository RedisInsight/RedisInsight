import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { EditEntireItemAction, Props } from './EditEntireItemAction'

const mockedProps = mock<Props>()

const valueOfEntireItem = 'Sample JSON'

describe('EditEntireItemAction', () => {
  it('renders correctly with provided props', () => {
    render(<EditEntireItemAction
      {...instance(mockedProps)}
      valueOfEntireItem={valueOfEntireItem}
    />)

    expect(screen.getByTestId('json-value')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toHaveValue(valueOfEntireItem)
  })

  it('triggers handleUpdateValueFormSubmit when the form is submitted', () => {
    const handleUpdateValueFormSubmit = jest.fn()
    render(<EditEntireItemAction
      {...instance(mockedProps)}
      handleUpdateValueFormSubmit={handleUpdateValueFormSubmit}
    />)

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(handleUpdateValueFormSubmit).toHaveBeenCalled()
  })

  it('triggers setEditEntireItem and setError when the cancel button is clicked', () => {
    const setEditEntireItem = jest.fn()
    const setError = jest.fn()
    const { getByLabelText } = render(<EditEntireItemAction
      {...instance(mockedProps)}
      setEditEntireItem={setEditEntireItem}
      setError={setError}
    />)
    fireEvent.click(getByLabelText('Cancel add'))

    expect(setEditEntireItem).toHaveBeenCalledWith(false)
    expect(setError).toHaveBeenCalledWith(null)
  })
})
