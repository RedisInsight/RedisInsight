import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import SettingsPage from './SettingsPage'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

/**
 * SettingsPage tests
 *
 * @group component
 */
describe('SettingsPage', () => {
  it('should render', () => {
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Appearance" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(container.querySelector('[data-test-subj="accordion-appearance"]')).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Privacy settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-privacy-settings"]')
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Advanced settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-advanced-settings"]')
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })

  it('Accordion "Workbench settings" should render', () => {
    const { container } = render(<SettingsPage />)

    expect(
      container.querySelector('[data-test-subj="accordion-workbench-settings"]')
    ).toBeInTheDocument()
    expect(render(<SettingsPage />)).toBeTruthy()
  })
})

describe('Telemetry', () => {
  it('change Cleanup setting', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    sendEventTelemetry.mockReset()

    render(<SettingsPage />)

    fireEvent.click(screen.getByTestId('switch-workbench-cleanup'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED,
      eventData: {
        currentValue: true,
        newValue: false,
      },
    })
  })
})
