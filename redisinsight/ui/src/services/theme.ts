import { BrowserStorageItem, Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { localStorageService } from './storage'

interface Themes {
  [theme: string]: string;
}

class ThemeService {
  readonly themes: Themes = {}
  readonly keyName = window.__RI_PROXY_PATH__ ? (window.__RI_PROXY_PATH__ + '_' +  BrowserStorageItem.theme) : BrowserStorageItem.theme
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
    localStorageService.set(this.keyName, actualTheme)
    document.body.classList.value = `theme_${newTheme}`
  }

  static getTheme() {
    return localStorageService.get(this.keyName)
  }
}
export const themeService = new ThemeService()
export default ThemeService
