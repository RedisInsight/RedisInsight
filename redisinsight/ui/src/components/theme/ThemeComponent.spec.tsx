import React from 'react'
import { act } from 'react-dom/test-utils';
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { BrowserStorageItem, Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { render } from 'uiSrc/utils/test-utils'

import ThemeComponent from './ThemeComponent'

describe('ThemeComponent', () => {
  it('should render', () => {
    expect(render(<ThemeComponent />)).toBeTruthy()
  })

  it('should handle theme change', () => {
    const themeContextValue = { changeTheme: jest.fn() }
    localStorageService.get = jest.fn().mockReturnValue(Theme.System)

    act(() => {
      render(
        <ThemeContext.Provider value={themeContextValue}>
          <ThemeComponent />
        </ThemeContext.Provider>
      )

      window.matchMedia(THEME_MATCH_MEDIA_DARK).dispatchEvent(new Event('change'))
    })

    expect(themeContextValue.changeTheme).toHaveBeenCalledWith(Theme.System)
  })

})
