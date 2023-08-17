import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JsonComponent from './JsonComponent'

describe('JsonComponent', () => {
  it('should render jsonObjectComponent', () => {
    const json = { value: JSON.stringify({}) }
    render(<JsonComponent data={json} />)

    expect(screen.getByTestId('json-object-component')).toBeInTheDocument()
  })

  it('should render json array component', () => {
    const json = ['123']
    render(<JsonComponent data={json} />)

    expect(screen.getByTestId('json-array-component')).toBeInTheDocument()
  })

  it('should render json primitive component', () => {
    const json = null
    render(<JsonComponent data={json} />)

    expect(screen.getByTestId('json-primitive-component')).toBeInTheDocument()
  })
})
