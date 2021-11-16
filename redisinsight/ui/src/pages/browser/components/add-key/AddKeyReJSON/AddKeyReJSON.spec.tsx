import React from 'react'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import AddKeyReJSON, { Props } from './AddKeyReJSON'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

const mockedProps = mock<Props>()

jest.mock('../AddKeyFooter/AddKeyFooter', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn()
}))

const MockAddKeyFooter = (props: any) => (
  <div {...props} />
)

describe('AddKeyReJSON', () => {
  beforeAll(() => {
    AddKeyFooter.mockImplementation(MockAddKeyFooter)
  })

  it('should render', () => {
    expect(render(<AddKeyReJSON {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set value properly', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    const valueArea = screen.getByTestId('json-value')
    fireEvent.change(
      valueArea,
      { target: { value: '{}' } }
    )
    expect(valueArea).toHaveValue('{}')
  })

  it('should render add key button', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-key-json-btn')).toBeTruthy()
  })

  it('should render add button disabled with wrong json', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    const valueArea = screen.getByTestId('json-value')
    const keyNameInput = screen.getByTestId('key')
    fireEvent.change(
      keyNameInput,
      { target: { value: 'keyName' } }
    )
    fireEvent.change(
      valueArea,
      { target: { value: '{"12' } }
    )
    expect(screen.getByTestId('add-key-json-btn')).toBeDisabled()
  })

  it('should render add button not disabled', () => {
    render(<AddKeyReJSON {...instance(mockedProps)} />)
    const valueArea = screen.getByTestId('json-value')
    const keyNameInput = screen.getByTestId('key')
    fireEvent.change(
      keyNameInput,
      { target: { value: 'keyName' } }
    )
    fireEvent.change(
      valueArea,
      { target: { value: '{}' } }
    )
    expect(screen.getByTestId('add-key-json-btn')).not.toBeDisabled()
  })
})
