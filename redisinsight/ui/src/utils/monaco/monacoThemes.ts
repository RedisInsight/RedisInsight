import { monaco as monacoEditor } from 'react-monaco-editor'

export enum RedisearchMonacoTheme {
  dark = 'redisearchDarkTheme',
  light = 'redisearchLightTheme'
}

export const installRedisearchTheme = () => {
  monacoEditor.editor.defineTheme(RedisearchMonacoTheme.dark, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '#569cd6', fontStyle: 'bold' },
      // { token: 'argument.token', foreground: '#6db9a2' },
      { token: 'argument.block.0', foreground: '#66ccaf' },
      { token: 'argument.block.1', foreground: '#459d7f' },
      { token: 'argument.block.2', foreground: '#3c816a' },
      { token: 'argument.block.3', foreground: '#28644f' },
      { token: 'loadAll', foreground: '#6db9a2' },
      { token: 'index', foreground: '#ce51cc' },
      { token: 'query', foreground: '#5183ce' },
      { token: 'field', foreground: '#c43265' },
    ],
    colors: {}
  })

  monacoEditor.editor.defineTheme(RedisearchMonacoTheme.light, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '#569cd6', fontStyle: 'bold' },
      { token: 'argument.block.0', foreground: '#66ccaf' },
      { token: 'argument.block.1', foreground: '#459d7f' },
      { token: 'argument.block.2', foreground: '#3c816a' },
      { token: 'argument.block.3', foreground: '#28644f' },
      { token: 'loadAll', foreground: '#6db9a2' },
      { token: 'index', foreground: '#ce51cc' },
      { token: 'field', foreground: '#5183ce' },
      { token: 'field', foreground: '#c43265' },
    ],
    colors: {}
  })
}
