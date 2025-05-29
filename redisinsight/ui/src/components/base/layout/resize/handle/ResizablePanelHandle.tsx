import React from 'react'

import {
  PanelResizeHandle,
  PanelResizeHandleProps,
} from 'react-resizable-panels'

import classNames from 'classnames'
import styles from './styles.module.scss'

const ResizablePanelHandle = ({
  className,
  ...rest
}: PanelResizeHandleProps) => (
  <PanelResizeHandle
    className={classNames(styles.handle, className)}
    {...rest}
  />
)

export default ResizablePanelHandle
