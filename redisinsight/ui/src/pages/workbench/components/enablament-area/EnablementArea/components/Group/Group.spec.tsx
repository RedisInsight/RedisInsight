import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Group, { Props } from './Group'

const mockedProps = mock<Props>()
const testId = 'quick-guides'

describe('Group', () => {
  it('should render', () => {
    expect(render(<Group {...instance(mockedProps)} testId={testId} />)).toBeTruthy()
  })
  it('should correctly render content', () => {
    const label = 'Quick Guides'
    const children = [
      <span key="item-1">Item 1</span>,
      <span key="item-2">Item 2</span>
    ]
    const { queryByTestId } = render(
      <Group {...instance(mockedProps)} testId={testId} label={label}>{children}</Group>
    )
    const accordionButton = queryByTestId(`accordion-button-${testId}`)
    expect(accordionButton).toHaveTextContent(label)
  })
})
