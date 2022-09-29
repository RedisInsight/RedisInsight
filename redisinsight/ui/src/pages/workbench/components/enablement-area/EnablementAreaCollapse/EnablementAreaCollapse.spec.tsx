import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import EnablementAreaCollapse from './EnablementAreaCollapse'

/**
 * EnablementAreaCollapse tests
 *
 * @group unit
 */
describe('EnablementAreaCollapse', () => {
  it('should render', () => {
    expect(render(<EnablementAreaCollapse isMinimized setIsMinimized={jest.fn} />)).toBeTruthy()
  })

  it('should be minimized', () => {
    const { queryByTestId } = render(<EnablementAreaCollapse isMinimized setIsMinimized={jest.fn} />)
    expect(queryByTestId('expand-enablement-area')).toBeInTheDocument()
  })

  it('should be expanded', () => {
    const { queryByTestId } = render(<EnablementAreaCollapse isMinimized={false} setIsMinimized={jest.fn} />)
    expect(queryByTestId('collapse-enablement-area')).toBeInTheDocument()
  })

  it('should expand', () => {
    const setIsMinimized = jest.fn()
    render(<EnablementAreaCollapse isMinimized setIsMinimized={setIsMinimized} />)
    fireEvent.click(screen.getByTestId('expand-enablement-area'))
    expect(setIsMinimized).toBeCalledWith(false)
  })

  it('should collapse', () => {
    const setIsMinimized = jest.fn()
    render(<EnablementAreaCollapse isMinimized={false} setIsMinimized={setIsMinimized} />)
    fireEvent.click(screen.getByTestId('collapse-enablement-area'))
    expect(setIsMinimized).toBeCalledWith(true)
  })
})
