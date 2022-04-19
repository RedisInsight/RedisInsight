import React from 'react'

interface IContext {
  setScript: (script: string, path?: string, name?: string) => void;
  openPage: (page: IInternalPage) => void;
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
