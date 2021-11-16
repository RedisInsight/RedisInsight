import React from 'react'

interface IContext {
  setScript: (script: string) => void;
  openPage: (page: IInternalPage) => void;
}
export interface IInternalPage {
  path: string,
  label: string;
  backTitle: string;
}
export const defaultValue = {
  setScript: (script: string) => script,
  openPage: (page: IInternalPage) => page
}
const EnablementAreaContext = React.createContext<IContext>(defaultValue)
export const EnablementAreaProvider = EnablementAreaContext.Provider
export default EnablementAreaContext
