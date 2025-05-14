import React, { createContext, useContext } from 'react'
import { ResizableContainerRegistry } from './types'

interface ContainerContextProps {
  registry?: ResizableContainerRegistry
}

export const ResizableContainerContext = createContext<ContainerContextProps>(
  {},
)

interface ContextProviderProps extends Required<ContainerContextProps> {
  /**
   * ReactNode to render as this component's content
   */
  children: any
}

export const ResizableContainerContextProvider = ({
  children,
  registry,
}: ContextProviderProps) => (
  <ResizableContainerContext.Provider value={{ registry }}>
    {children}
  </ResizableContainerContext.Provider>
)

export const useResizableContainerContext = () => {
  const context = useContext(ResizableContainerContext)
  if (!context.registry) {
    throw new Error(
      'useResizableContainerContext must be used within a <ResizableContainerContextProvider />',
    )
  }
  return context
}
