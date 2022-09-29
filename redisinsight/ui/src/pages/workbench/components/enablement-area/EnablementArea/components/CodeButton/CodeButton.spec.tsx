import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import CodeButton, { Props } from './CodeButton'

const mockedProps = mock<Props>()

/**
 * CodeButton tests
 *
 * @group unit
 */
describe('CodeButton', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(<CodeButton {...instance(mockedProps)} label={label} />)
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })
  it('should call onClick function', () => {
    const onClick = jest.fn()
    const label = 'Manual'

    render(<CodeButton {...instance(mockedProps)} label={label} onClick={onClick} />)
    fireEvent.click(screen.getByTestId(`preselect-${label}`))

    expect(onClick).toBeCalled()
  })
})
