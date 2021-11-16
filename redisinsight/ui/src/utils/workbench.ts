import { Dispatch, PayloadAction } from '@reduxjs/toolkit'
import { BrowserStorageItem } from 'uiSrc/constants'
import { WBQueryType } from 'uiSrc/pages/workbench/constants'
import { localStorageService } from 'uiSrc/services'
import { updateWBCommandHistory } from 'uiSrc/slices/workbench/wb-results'
import { IPluginVisualization } from 'uiSrc/slices/interfaces'
import { getVisualizationsByCommand } from 'uiSrc/utils/plugins'

const updateWBHistoryStorage = (
  command: string = '',
  dispatch: Dispatch<PayloadAction<string[]>>
) => {
  if (!command) {
    return
  }
  const maxCountCommandHistory = 30

  const commandHistoryPrev = localStorageService.get(BrowserStorageItem.wbInputHistory) ?? []

  const commandHistory = [command?.trim()]
    .concat(commandHistoryPrev)
    .slice(0, maxCountCommandHistory)

  localStorageService.set(
    BrowserStorageItem.wbInputHistory,
    commandHistory.slice(0, maxCountCommandHistory)
  )

  dispatch?.(updateWBCommandHistory?.(commandHistory))
}

const getWBQueryType = (query: string = '', views: IPluginVisualization[] = []) => {
  const defaultPluginView = getVisualizationsByCommand(query, views)
    .find((view) => view.default)

  return defaultPluginView ? WBQueryType.Plugin : WBQueryType.Text
}

export { updateWBHistoryStorage, getWBQueryType }
