import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import Table from './Table'

describe('Table', () => {
  const columns = [
    { field: 'name', name: 'Name' },
    { field: 'age', name: 'Age' }
  ]

  const items = [
    { name: 'John Doe', age: 25 },
    { name: 'Jane Smith', age: 30 }
  ]

  it('should render', () => {
    expect(render(<Table id="test-table" columns={columns} items={items} initialSortField="name" />)).toBeTruthy()
  })
})
