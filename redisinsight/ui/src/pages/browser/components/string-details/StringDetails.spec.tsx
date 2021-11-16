import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import StringDetails, { Props } from './StringDetails'

const STRING_VALUE = 'string-value'
const STRING_VALUE_SPACE = 'string value'

const mockedProps = mock<Props>()

describe('StringDetails', () => {
  it('should render', () => {
    expect(
      render(
        <StringDetails
          {...instance(mockedProps)}
        />
      )
    ).toBeTruthy()
  })

  it('should render textarea if edit mode', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    expect(textArea).toBeInTheDocument()
  })

  it('should update string value', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it('should stay empty string after cancel', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    const btnACancel = screen.getByTestId('cancel-btn')
    fireEvent(
      btnACancel,
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(textArea).toHaveValue('')
  })

  it('should update value after apply', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    const btnApply = screen.getByTestId('apply-btn')
    fireEvent(
      btnApply,
      new MouseEvent(
        'click',
        {
          bubbles: true
        }
      )
    )
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })
})
