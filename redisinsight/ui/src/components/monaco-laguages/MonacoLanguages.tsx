import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { monaco } from 'react-monaco-editor'
import { findIndex } from 'lodash'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { MonacoLanguage, redisLanguageConfig, Theme } from 'uiSrc/constants'
import { getRedisMonarchTokensProvider } from 'uiSrc/utils'
import { darkTheme, lightTheme, MonacoThemes } from 'uiSrc/constants/monaco/cypher'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

const MonacoLanguages = () => {
  const { theme } = useContext(ThemeContext)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(appRedisCommandsSelector)

  useEffect(() => {
    if (monaco?.editor) {
      monaco.editor.defineTheme(MonacoThemes.Dark, darkTheme)
      monaco.editor.defineTheme(MonacoThemes.Light, lightTheme)
    }
  }, [])

  useEffect(() => {
    monaco.editor.setTheme(theme === Theme.Dark ? MonacoThemes.Dark : MonacoThemes.Light)
  }, [theme])

  useEffect(() => {
    if (!REDIS_COMMANDS_ARRAY.length) return

    setupMonacoRedisLang()
  }, [REDIS_COMMANDS_ARRAY])

  const setupMonacoRedisLang = () => {
    const languages = monaco.languages.getLanguages()
    const isRedisLangRegistered = findIndex(languages, { id: MonacoLanguage.Redis }) > -1
    if (!isRedisLangRegistered) {
      monaco.languages.register({ id: MonacoLanguage.Redis })
    }

    monaco.languages.setLanguageConfiguration(MonacoLanguage.Redis, redisLanguageConfig)
    monaco.languages.setMonarchTokensProvider(
      MonacoLanguage.Redis,
      getRedisMonarchTokensProvider(REDIS_COMMANDS_ARRAY)
    )
  }

  return null
}

export default MonacoLanguages
