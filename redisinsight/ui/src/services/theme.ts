import { isFunction } from 'lodash'
import { BrowserStorageItem, Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { localStorageService } from './storage'

interface CSSFile {
  use: () => void;
  unuse: () => void;
}

interface Themes {
  [theme: string]: CSSFile[];
}

class ThemeService {
  readonly themes: Themes = {}

  registerTheme(theme: Theme, cssFiles: any) {
    this.themes[theme] = cssFiles
  }

  applyTheme(newTheme: Theme) {
    let actualTheme = newTheme
    if (newTheme === Theme.System) {
      if (window.matchMedia && window.matchMedia(THEME_MATCH_MEDIA_DARK).matches) {
        newTheme = Theme.Dark
      } else {
        newTheme = Theme.Light
      }
    }

    Object.values(this.themes).forEach((theme: CSSFile[]) =>
      theme.forEach(
        (cssFile: CSSFile) => isFunction(cssFile?.unuse) && cssFile.unuse()
      ))
    this.themes[newTheme].forEach(
      (cssFile: CSSFile) => isFunction(cssFile?.use) && cssFile.use()
    )
    localStorageService.set(BrowserStorageItem.theme, actualTheme)
  }

  static getTheme() {
    return localStorageService.get(BrowserStorageItem.theme)
  }
}
export const themeService = new ThemeService()
export default ThemeService
