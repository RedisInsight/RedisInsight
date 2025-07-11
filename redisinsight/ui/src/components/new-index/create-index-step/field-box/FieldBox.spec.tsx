import React from 'react'
import { BoxSelectionGroup } from '@redis-ui/components'

import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { MOCK_VECTOR_SEARCH_BOX } from 'uiSrc/constants/mocks/mock-vector-index-search'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { FieldBox, FieldBoxProps } from './FieldBox'
import { VectorSearchBox } from './types'

const renderFieldBoxComponent = (props?: FieldBoxProps) => {
  const defaultProps: FieldBoxProps = {
    box: MOCK_VECTOR_SEARCH_BOX,
  }

  return render(
    <BoxSelectionGroup.Compose>
      <FieldBox {...defaultProps} {...props} />
    </BoxSelectionGroup.Compose>,
  )
}

describe('CreateIndexStepWrapper', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const props: FieldBoxProps = {
      box: {
        ...MOCK_VECTOR_SEARCH_BOX,
        value: 'id',
        label: 'id',
        text: 'Unique product identifier',
        tag: FieldTypes.TAG,
        disabled: false,
      },
    }

    const { container } = renderFieldBoxComponent(props)

    expect(container).toBeTruthy()

    // Check if the box is rendered with the correct visual elements
    const label = screen.getByText(props.box.label!)
    const description = screen.getByText(props.box.text!)
    const tag = screen.getByText(props.box.tag.toUpperCase()!)
    const checkbox = screen.getByRole('checkbox')

    expect(label).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(tag).toBeInTheDocument()
    expect(checkbox).toBeInTheDocument()
  })

  it('should select the box when clicked', () => {
    renderFieldBoxComponent()

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    const box = screen.getByTestId(`field-box-${MOCK_VECTOR_SEARCH_BOX.value}`)
    fireEvent.click(box)

    expect(checkbox).toBeChecked()
  })

  it('should not select the box when clicked if disabled', () => {
    const disabledBox: VectorSearchBox = {
      ...MOCK_VECTOR_SEARCH_BOX,
      disabled: true,
    }

    renderFieldBoxComponent({ box: disabledBox })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    const box = screen.getByTestId(`field-box-${disabledBox.value}`)
    fireEvent.click(box)

    expect(checkbox).not.toBeChecked()
  })
})
