import React, { createContext, useContext } from 'react'
import { Nullable } from 'uiSrc/utils'

interface HeaderContextType {
  headerContent: Nullable<React.ReactNode>
  setHeaderContent: (content: Nullable<React.ReactNode>) => void
}

// Create a context
const HeaderContext = createContext<HeaderContextType>({
  headerContent: null,
  setHeaderContent: () => {}
})

// Custom hook to access the header context
export const useModalHeader = () => useContext(HeaderContext)
export const HeaderProvider = HeaderContext.Provider
