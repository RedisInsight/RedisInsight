import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { Theme, THEMES } from 'uiSrc/constants'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'

import ThemeSettings from './ThemeSettings'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/user/user-settings', () => {
  const original = jest.requireActual('uiSrc/slices/user/user-settings')
  return {
    ...original,
    updateUserConfigSettingsAction: jest.fn(() => ({ type: 'TEST_ACTION' })),
  }
})

const { sendEventTelemetry } = require('uiSrc/telemetry')

let store: typeof mockedStore

describe('ThemeSettings', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
  })

  it('should render', () => {
    expect(render(<ThemeSettings />)).toBeTruthy()
  })

  it('should update the selected theme and dispatch telemetry on change', async () => {
    const initialTheme = Theme.Dark
    const newTheme = Theme.Light

    // @ts-ignore-next-line
    store.getState().user.settings.config = {
      ...store.getState().user.settings.config,
      theme: initialTheme,
    }

    render(<ThemeSettings />, { store })

    const dropdownButton = screen.getByTestId('select-theme')
    fireEvent.click(dropdownButton)

    await waitFor(() => {
      expect(screen.getByText('Light Theme')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Light Theme'))

    expect(updateUserConfigSettingsAction).toHaveBeenCalledWith({
      theme: newTheme,
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SETTINGS_COLOR_THEME_CHANGED,
      eventData: {
        previousColorTheme: initialTheme,
        currentColorTheme: newTheme,
      },
    })
  })

  it('should display all theme options from THEMES', async () => {
    // @ts-ignore-next-line
    store.getState().user.settings.config = {
      ...store.getState().user.settings.config,
      theme: Theme.Dark,
    }

    render(<ThemeSettings />, { store })

    const dropdownButton = screen.getByTestId('select-theme')
    fireEvent.click(dropdownButton)

    const darkTheme = THEMES.find((theme) => theme.value === Theme.Dark)

    const rest = THEMES.filter((theme) => theme.value !== Theme.Dark)

    await waitFor(() => {
      // Selected theme name appears 2 times in the dropdown
      // once in the list and once in the selected value
      expect(
        screen.queryAllByText(darkTheme?.inputDisplay as string).length,
      ).toEqual(2)

      rest.forEach((theme) => {
        expect(
          screen.getByText(theme.inputDisplay as string),
        ).toBeInTheDocument()
      })
    })
  })
})
