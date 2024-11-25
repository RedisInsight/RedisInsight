import React from 'react'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

import { AddDbType } from 'uiSrc/pages/home/constants'
import AddDatabaseFlowTabs from './AddDatabaseFlowTabs'

describe('AddDatabaseFlowTabs', () => {
  it('should render', () => {
    expect(render(<AddDatabaseFlowTabs connectionType={AddDbType.manual} onChange={jest.fn()} />)).toBeTruthy()
  })

  it('should change tab', () => {
    const onChange = jest.fn()
    render(<AddDatabaseFlowTabs connectionType={AddDbType.manual} onChange={onChange} />)

    fireEvent.click(screen.getByTestId('add-database_tab_cloud'))

    expect(onChange).toBeCalledWith(AddDbType.cloud)
  })
})
