import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { ADD_DATA_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/add-key/constants/data-type-options'
import AddKey from './AddKey'

const handleAddKeyPanelMock = () => {}
const handleCloseKeyMock = () => {}

describe('AddKey', () => {
  it('should render', () => {
    expect(render(<AddKey
      handleAddKeyPanel={handleAddKeyPanelMock}
      handleCloseKey={handleCloseKeyMock}
    />)).toBeTruthy()
  })

  it('should render type select label', () => {
    render(<AddKey
      handleAddKeyPanel={handleAddKeyPanelMock}
      handleCloseKey={handleCloseKeyMock}
    />)

    expect(screen.getByText(/Data Type\*/i)).toBeInTheDocument()
  })

  it('should have data type select with predefined first value from options', () => {
    render(<AddKey
      handleAddKeyPanel={handleAddKeyPanelMock}
      handleCloseKey={handleCloseKeyMock}
    />)

    expect(screen.getByDisplayValue(ADD_DATA_TYPE_OPTIONS[0].value)).toBeInTheDocument()
  })
})
