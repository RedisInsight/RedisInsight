import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import Table, { Props } from './Table'

const mockedProps = mock<Props>()

const mockData = [
  {
    name: 'name',
    type: 'HASH',
    memory: 1000,
    length: 10,
    ttl: 10
  },
  {
    name: 'name_1',
    type: 'HASH',
    memory: 1000,
    length: undefined,
    ttl: -1
  }
]

describe('Table', () => {
  it('should render', () => {
    expect(render(<Table {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render', () => {
    expect(render(<Table {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render table with 2 items', () => {
    render(<Table {...instance(mockedProps)} data={mockData} />)
    expect(screen.getAllByTestId('top-keys-table-name')).toHaveLength(2)
  })

  it('should render correct ttl', () => {
    render(<Table {...instance(mockedProps)} data={mockData} />)
    expect(screen.getByTestId('ttl-no-limit-name_1')).toBeInTheDocument()
    expect(screen.getByTestId('ttl-name')).toBeInTheDocument()
  })

  it('should render correct length', () => {
    render(<Table {...instance(mockedProps)} data={mockData} />)
    expect(screen.getByTestId('length-empty-name_1')).toBeInTheDocument()
    expect(screen.getByTestId('length-value-name')).toBeInTheDocument()
  })
})
