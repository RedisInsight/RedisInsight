import { fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import React from 'react'
import { setWorkbenchCleanUp } from 'uiSrc/slices/user/user-settings'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import SettingsPage from './SettingsPage'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})


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

  it('should call proper actions after click on switch wb clear mode', () => {
    render(<SettingsPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('switch-workbench-cleanup'))

    expect(store.getActions())
      .toEqual([...afterRenderActions, setWorkbenchCleanUp(true)])
  })
})
