import { monaco } from 'react-monaco-editor'

export const darkThemeRules = [
  { token: 'function', foreground: 'BFBC4E' }
]

export const lightThemeRules = [
  { token: 'function', foreground: '795E26' }
]

export enum MonacoThemes {
  Dark = 'dark',
  Light = 'light'
}

export const darkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: darkThemeRules,
  colors: {}
}

export const lightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: lightThemeRules,
  colors: {}
}
