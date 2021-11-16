import { EuiSuperSelectOption } from '@elastic/eui'

export enum Theme {
  Dark = 'DARK',
  Light = 'LIGHT',
}

export const THEMES: EuiSuperSelectOption<string>[] = [
  {
    inputDisplay: 'Dark Theme',
    value: Theme.Dark,
  },
  {
    inputDisplay: 'Light Theme',
    value: Theme.Light,
  },
]

export default THEMES
