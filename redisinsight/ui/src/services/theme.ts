import { BrowserStorageItem, Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { localStorageService } from './storage'

interface Themes {
  [theme: string]: string;
}

class ThemeService {
  readonly themes: Themes = {}

  registerTheme(theme: Theme, cssFiles: any) {
    this.themes[theme] = cssFiles
  }

  applyTheme(newTheme: Theme) {
    const actualTheme = newTheme
    if (newTheme === Theme.System) {
      if (window.matchMedia && window.matchMedia(THEME_MATCH_MEDIA_DARK).matches) {
        newTheme = Theme.Dark
      } else {
        newTheme = Theme.Light
      }
    }

    const sheet = new CSSStyleSheet()
    sheet?.replaceSync(this.themes[newTheme])

    document.adoptedStyleSheets = [sheet]

    localStorageService.set(BrowserStorageItem.theme, actualTheme)
    document.body.classList.value = `theme_${newTheme}`
  }

  static getTheme() {
    return localStorageService.get(BrowserStorageItem.theme)
  }
}
export const themeService = new ThemeService()
export default ThemeService
