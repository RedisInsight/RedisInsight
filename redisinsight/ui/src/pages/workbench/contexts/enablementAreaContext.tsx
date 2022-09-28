import React from 'react'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

interface IContext {
  setScript: (
    script: string,
    execute?: { mode?: ExecuteButtonMode, params?: CodeButtonParams },
    file?: { path?: string, name?: string }
  ) => void
  openPage: (page: IInternalPage) => void
  isCodeBtnDisabled?: boolean
}
export interface IInternalPage {
  path: string,
  label?: string;
}
export const defaultValue = {
  setScript: (script: string) => script,
  openPage: (page: IInternalPage) => page,
  isCodeBtnDisabled: false
}
const EnablementAreaContext = React.createContext<IContext>(defaultValue)
export const EnablementAreaProvider = EnablementAreaContext.Provider
export default EnablementAreaContext
