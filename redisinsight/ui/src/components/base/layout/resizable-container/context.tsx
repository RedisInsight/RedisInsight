
import React, { createContext, useContext } from 'react'
import { EuiResizableContainerRegistry } from './types'

interface ContainerContextProps {
  registry?: EuiResizableContainerRegistry;
}

export const ResizableContainerContext = createContext<ContainerContextProps>({});

interface ContextProviderProps extends Required<ContainerContextProps> {
  /**
   * ReactNode to render as this component's content
   */
  children: any;
}

export const EuiResizableContainerContextProvider = ({
  children,
  registry,
}: ContextProviderProps) => (
  <ResizableContainerContext.Provider value={{ registry }}>
    {children}
  </ResizableContainerContext.Provider>
)

export const useEuiResizableContainerContext = () => {
  const context = useContext(ResizableContainerContext);
  if (!context.registry) {
    throw new Error(
      'useEuiResizableContainerContext must be used within a <EuiResizableContainerContextProvider />'
    );
  }
  return context;
};