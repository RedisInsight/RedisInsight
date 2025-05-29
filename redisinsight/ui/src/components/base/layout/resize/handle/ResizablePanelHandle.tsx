import React from 'react'

import {
  PanelResizeHandle,
  PanelResizeHandleProps,
} from 'react-resizable-panels'

import styles from './styles.module.scss'

const ResizablePanelHandle = (props: PanelResizeHandleProps) => (
  <PanelResizeHandle className={styles.handle} {...props} />
)

export default ResizablePanelHandle
