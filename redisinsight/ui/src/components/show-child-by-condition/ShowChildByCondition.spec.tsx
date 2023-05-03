import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ShowChildByCondition from './ShowChildByCondition'

const A = ({ children }: { children: React.ReactElement }) => <div data-testid="a-wrapper"><div data-testid="a-inner">{children}</div></div>
const B = () => <div data-testid="b-inner">1</div>

describe('ShowChildByCondition', () => {
  it('should render', () => {
    expect(render(<ShowChildByCondition isShow><A><B /></A></ShowChildByCondition>)).toBeTruthy()
  })

  it('should render A and B', () => {
    render(<ShowChildByCondition isShow><A><B /></A></ShowChildByCondition>)

    expect(screen.getByTestId('a-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('a-inner')).toBeInTheDocument()
    expect(screen.getByTestId('b-inner')).toBeInTheDocument()
  })

  it('should render only B', () => {
    render(<ShowChildByCondition isShow={false}><A><B /></A></ShowChildByCondition>)

    expect(screen.queryByTestId('a-wrapper')).not.toBeInTheDocument()
    expect(screen.queryByTestId('a-inner')).not.toBeInTheDocument()
    expect(screen.getByTestId('b-inner')).toBeInTheDocument()
  })
})
