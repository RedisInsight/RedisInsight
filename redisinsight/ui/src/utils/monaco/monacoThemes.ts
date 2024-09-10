import { monaco as monacoEditor } from 'react-monaco-editor'
import { redisearchDarKThemeRules, redisearchLightThemeRules } from 'uiSrc/constants/monaco'

export enum RedisearchMonacoTheme {
  dark = 'redisearchDarkTheme',
  light = 'redisearchLightTheme'
}

export const installRedisearchTheme = () => {
  monacoEditor.editor.defineTheme(RedisearchMonacoTheme.dark, {
    base: 'vs-dark',
    inherit: true,
    rules: redisearchDarKThemeRules,
    colors: {}
  })

  monacoEditor.editor.defineTheme(RedisearchMonacoTheme.light, {
    base: 'vs',
    inherit: true,
    rules: redisearchLightThemeRules,
    colors: {}
  })
}
