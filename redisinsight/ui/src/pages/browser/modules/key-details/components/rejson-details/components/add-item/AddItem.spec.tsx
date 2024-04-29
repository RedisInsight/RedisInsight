import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent } from '@testing-library/react'
import { render, screen } from 'uiSrc/utils/test-utils'

import AddItem, { Props } from './AddItem'
import { JSONErrors } from '../../constants'

const mockedProps = mock<Props>()

describe('AddItem', () => {
  it('should render', () => {
    expect(render(<AddItem {...mockedProps} />)).toBeTruthy()
  })

  it('should show error with invalid key', () => {
    render(<AddItem {...mockedProps} isPair onCancel={jest.fn} />)

    fireEvent.change(screen.getByTestId('json-key'), { target: { value: '"' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(JSONErrors.keyCorrectSyntax)
  })

  it('should show error with invalid value', () => {
    render(<AddItem {...mockedProps} onCancel={jest.fn} />)

    expect(screen.queryByTestId('json-key')).not.toBeInTheDocument()

    fireEvent.change(screen.getByTestId('json-value'), { target: { value: '"' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(JSONErrors.valueJSONFormat)
  })

  it('should submit with proper key and value', () => {
    const onSubmit = jest.fn()
    render(<AddItem {...mockedProps} isPair onCancel={jest.fn} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByTestId('json-key'), { target: { value: '"key"' } })
    fireEvent.change(screen.getByTestId('json-value'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(onSubmit).toBeCalledWith({ key: '"key"', value: '1' })
  })
})
