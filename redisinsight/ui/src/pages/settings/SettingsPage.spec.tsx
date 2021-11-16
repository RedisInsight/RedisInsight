import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import SettingsPage from './SettingsPage'

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
})
