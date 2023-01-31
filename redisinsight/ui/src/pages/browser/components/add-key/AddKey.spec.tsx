import React from 'react'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ADD_KEY_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/add-key/constants/key-type-options'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import AddKey from './AddKey'

const handleAddKeyPanelMock = () => {}
const handleCloseKeyMock = () => {}

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
    modules: []
  }),
}))

describe('AddKey', () => {
  it('should render', () => {
    expect(render(<AddKey
      onAddKeyPanel={handleAddKeyPanelMock}
      onClosePanel={handleCloseKeyMock}
    />)).toBeTruthy()
  })

  it('should render type select label', () => {
    render(<AddKey
      onAddKeyPanel={handleAddKeyPanelMock}
      onClosePanel={handleCloseKeyMock}
    />)

    expect(screen.getByText(/Key Type\*/i)).toBeInTheDocument()
  })

  it('should have key type select with predefined first value from options', () => {
    render(<AddKey
      onAddKeyPanel={handleAddKeyPanelMock}
      onClosePanel={handleCloseKeyMock}
    />)

    expect(screen.getByDisplayValue(ADD_KEY_TYPE_OPTIONS[0].value)).toBeInTheDocument()
  })

  it('should show text if db not contains ReJSON module', async () => {
    render(<AddKey
      onAddKeyPanel={handleAddKeyPanelMock}
      onClosePanel={handleCloseKeyMock}
    />)

    fireEvent.click(screen.getByTestId('select-key-type'))
    await act(() => {
      fireEvent.click(
        screen.queryByText('JSON') || document
      )
    })

    expect(screen.getByTestId('json-not-loaded-text')).toBeInTheDocument()
  })

  it('should not show text if db contains ReJSON module', async () => {
    (connectedInstanceSelector as jest.Mock).mockImplementation(() => ({
      modules: [{ name: RedisDefaultModules.FT }, { name: RedisDefaultModules.ReJSON }]
    }))

    render(<AddKey
      onAddKeyPanel={handleAddKeyPanelMock}
      onClosePanel={handleCloseKeyMock}
    />)

    fireEvent.click(screen.getByTestId('select-key-type'))
    await act(() => {
      fireEvent.click(
        screen.queryByText('JSON') || document
      )
    })

    expect(screen.queryByTestId('json-not-loaded-text')).not.toBeInTheDocument()
  })
})
