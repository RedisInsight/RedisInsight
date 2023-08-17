import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JsonPrimitive from './JsonPrimitive'

describe('JsonPrimitive', () => {
  it('should render', () => {
    expect(render(<JsonPrimitive data={null} />)).toBeTruthy()
  })

  it('should render proper text and value for null', () => {
    render(<JsonPrimitive data={null} />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('null')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('null')
  })

  it('should render proper text and value for number', () => {
    render(<JsonPrimitive data={1} />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('1')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('number')
  })

  it('should render proper text and value for boolean', () => {
    render(<JsonPrimitive data={false} />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('false')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('boolean')
  })

  it('should render proper text and value for string', () => {
    render(<JsonPrimitive data="123" />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('"123"')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('string')
  })

  it('should render proper text and value for bigint', () => {
    render(<JsonPrimitive data={BigInt(123)} />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('123')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('bigint')
  })

  it('should render proper text and value for other types', () => {
    render(<JsonPrimitive data={new Map()} />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('[object Map]')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('otherValue')
  })

  it('should render proper text and value for true', () => {
    render(<JsonPrimitive data />)

    expect(screen.getByTestId('json-primitive-value')).toHaveTextContent('true')
    expect(screen.getByTestId('json-primitive-value')).toHaveClass('boolean')
  })

  it('should render coma', () => {
    render(<JsonPrimitive data lastElement={false} />)

    expect(screen.getByTestId('json-primitive-component')).toHaveTextContent('true,')
  })

  it('should not render coma', () => {
    render(<JsonPrimitive data lastElement />)

    expect(screen.getByTestId('json-primitive-component')).toHaveTextContent('true')
  })
})
