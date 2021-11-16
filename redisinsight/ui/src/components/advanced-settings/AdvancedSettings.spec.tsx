import React from 'react'
import {
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import AdvancedSettings from './AdvancedSettings'

jest.mock('uiSrc/slices/user/user-settings', () => ({
  ...jest.requireActual('uiSrc/slices/user/user-settings'),
  userSettingsSelector: jest.fn().mockReturnValue({
    config: {
      scanThreshold: 10000
    },
  }),
  updateUserConfigSettingsAction: () => jest.fn
}))

describe('AdvancedSettings', () => {
  it('should render', () => {
    expect(render(<AdvancedSettings />)).toBeTruthy()
  })

  it('should render keys to scan value', () => {
    render(<AdvancedSettings />)
    expect(screen.getByTestId(/keys-to-scan-value/)).toHaveTextContent('10000')
  })

  it('should render keys to scan input after click value', () => {
    render(<AdvancedSettings />)
    screen.getByTestId(/keys-to-scan-value/).click()
    expect(screen.getByTestId(/keys-to-scan-input/)).toBeInTheDocument()
  })

  it('should change keys to scan input properly', () => {
    render(<AdvancedSettings />)
    screen.getByTestId(/keys-to-scan-value/).click()
    fireEvent.change(
      screen.getByTestId(/keys-to-scan-input/),
      {
        target: { value: '6900' }
      }
    )
    expect(screen.getByTestId(/keys-to-scan-input/)).toHaveValue('6900')
  })

  it('should properly apply changes', () => {
    render(<AdvancedSettings />)

    screen.getByTestId(/keys-to-scan-value/).click()
    fireEvent.change(
      screen.getByTestId(/keys-to-scan-input/),
      {
        target: { value: '6900' }
      }
    )
    screen.getByTestId(/apply-btn/).click()
    expect(screen.getByTestId(/keys-to-scan-value/)).toHaveTextContent('6900')
  })

  it('should properly decline changes', () => {
    render(<AdvancedSettings />)
    screen.getByTestId(/keys-to-scan-value/).click()

    fireEvent.change(
      screen.getByTestId(/keys-to-scan-input/),
      {
        target: { value: '6900' }
      }
    )
    screen.getByTestId(/cancel-btn/).click()
    expect(screen.getByTestId(/keys-to-scan-value/)).toHaveTextContent('10000')
  })
})
