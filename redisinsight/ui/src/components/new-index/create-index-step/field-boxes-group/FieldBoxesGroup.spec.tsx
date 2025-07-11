import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { MOCK_VECTOR_SEARCH_BOX } from 'uiSrc/constants/mocks/mock-vector-index-search'
import { FieldBoxesGroup, FieldBoxesGroupProps } from './FieldBoxesGroup'

const renderFieldBoxesGroupComponent = (
  props?: Partial<FieldBoxesGroupProps>,
) => {
  const defaultProps: FieldBoxesGroupProps = {
    boxes: [MOCK_VECTOR_SEARCH_BOX],
    value: [MOCK_VECTOR_SEARCH_BOX.value],
    onChange: jest.fn(),
  }

  return render(<FieldBoxesGroup {...defaultProps} {...props} />)
}

describe('FieldBoxesGroup', () => {
  it('should render', () => {
    const { container } = renderFieldBoxesGroupComponent()

    expect(container).toBeTruthy()

    const fieldBoxesGroup = screen.getByTestId('field-boxes-group')
    expect(fieldBoxesGroup).toBeInTheDocument()

    const fieldBoxes = screen.getAllByTestId(/field-box-/)
    expect(fieldBoxes).toHaveLength(1)
  })

  it('should call onChange when clicking on a box to select it', () => {
    const onChangeMock = jest.fn()
    const value: string[] = []

    renderFieldBoxesGroupComponent({ value, onChange: onChangeMock })

    const box = screen.getByTestId(`field-box-${MOCK_VECTOR_SEARCH_BOX.value}`)

    fireEvent.click(box)
    expect(onChangeMock).toHaveBeenCalledWith([MOCK_VECTOR_SEARCH_BOX.value])
  })

  it('should call onChange when clicking on a box to deselect it', () => {
    const onChangeMock = jest.fn()
    const value: string[] = [MOCK_VECTOR_SEARCH_BOX.value]

    renderFieldBoxesGroupComponent({ value, onChange: onChangeMock })

    const box = screen.getByTestId(`field-box-${MOCK_VECTOR_SEARCH_BOX.value}`)

    fireEvent.click(box)
    expect(onChangeMock).toHaveBeenCalledWith([])
  })
})
