import React from 'react'

import {
  ImperativePanelGroupHandle,
  PanelGroup,
  PanelGroupProps,
} from 'react-resizable-panels'

interface ResizableContainerProps extends PanelGroupProps {
  ref?: React.Ref<ImperativePanelGroupHandle>
}

const ResizableContainer = ({ ref, ...rest }: ResizableContainerProps) => (
  <PanelGroup ref={ref} {...rest} />
)

export default ResizableContainer
