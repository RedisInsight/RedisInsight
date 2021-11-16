import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { validateScoreNumber } from 'uiSrc/utils'
import InlineItemEditor, { Props } from './InlineItemEditor'

const mockedProps = mock<Props>()
const INLINE_ITEM_EDITOR = 'inline-item-editor'

describe('InlineItemEditor', () => {
  it('should render', () => {
    expect(
      render(
        <InlineItemEditor
          {...instance(mockedProps)}
          onDecline={jest.fn()}
        />
      )
    ).toBeTruthy()
  })

  it('should change value properly', () => {
    render(<InlineItemEditor {...instance(mockedProps)} onDecline={jest.fn()} />)
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), { target: { value: 'val' } })
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('val')
  })

  it('should change value properly with validation', () => {
    render(<InlineItemEditor
      {...instance(mockedProps)}
      onDecline={jest.fn()}
      validation={validateScoreNumber}
    />)
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), { target: { value: 'val123' } })
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue(validateScoreNumber('val123'))
  })
})
