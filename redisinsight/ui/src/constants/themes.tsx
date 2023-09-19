import { EuiSuperSelectOption } from '@elastic/eui'

export enum Theme {
  Dark = 'DARK',
  Light = 'LIGHT',
  System = 'SYSTEM',
}

export const THEMES: EuiSuperSelectOption<string>[] = [
  {
    inputDisplay: 'Match System',
    value: Theme.System,
  },
  {
    inputDisplay: 'Dark Theme',
    value: Theme.Dark,
  },
  {
    inputDisplay: 'Light Theme',
    value: Theme.Light,
  },
]

export const THEME_MATCH_MEDIA_DARK = '(prefers-color-scheme: dark)'

export default THEMES
