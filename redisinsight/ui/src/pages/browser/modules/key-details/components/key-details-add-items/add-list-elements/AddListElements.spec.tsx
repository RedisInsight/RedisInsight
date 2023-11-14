import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddListElements, { HEAD_DESTINATION, Props } from './AddListElements'

const mockedProps = mock<Props>()

describe('AddListElements', () => {
  it('should render', () => {
    expect(render(<AddListElements {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set elements input properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const elementsInput = screen.getByTestId('elements-input')
    fireEvent.change(
      elementsInput,
      { target: { value: '123' } }
    )
    expect(elementsInput).toHaveValue('123')
  })

  it('should set destination properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const destinationSelect = screen.getByTestId('destination-select')
    fireEvent.change(
      destinationSelect,
      { target: { value: HEAD_DESTINATION } }
    )
    expect(destinationSelect).toHaveValue(HEAD_DESTINATION)
  })
})
