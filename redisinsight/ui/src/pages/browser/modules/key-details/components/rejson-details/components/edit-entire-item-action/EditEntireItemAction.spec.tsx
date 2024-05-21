import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { JSONErrors } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/constants'
import EditEntireItemAction, { Props } from './EditEntireItemAction'

const mockedProps = mock<Props>()

const valueOfEntireItem = '"Sample string"'

describe('EditEntireItemAction', () => {
  it('renders correctly with provided props', () => {
    render(<EditEntireItemAction
      {...instance(mockedProps)}
      initialValue={valueOfEntireItem}
    />)

    expect(screen.getByTestId('json-value')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toHaveValue(valueOfEntireItem)
  })

  it('triggers handleUpdateValueFormSubmit when the form is submitted', () => {
    const handleUpdateValueFormSubmit = jest.fn()
    render(<EditEntireItemAction
      {...instance(mockedProps)}
      initialValue={valueOfEntireItem}
      onSubmit={handleUpdateValueFormSubmit}
    />)

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(handleUpdateValueFormSubmit).toHaveBeenCalled()
  })

  it('shouuld show error and do not submit', () => {
    const handleUpdateValueFormSubmit = jest.fn()
    render(<EditEntireItemAction
      {...instance(mockedProps)}
      initialValue="xxxx"
      onSubmit={handleUpdateValueFormSubmit}
    />)

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(JSONErrors.valueJSONFormat)
    expect(handleUpdateValueFormSubmit).not.toHaveBeenCalled()
  })
})
