import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import EnablementAreaCollapse from './EnablementAreaCollapse'

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
})
