import React from 'react'

import {
  PanelResizeHandle,
  PanelResizeHandleProps,
} from 'react-resizable-panels'

import classNames from 'classnames'
import styles from './styles.module.scss'

interface ResizablePanelHandleProps extends PanelResizeHandleProps {
  direction?: 'horizontal' | 'vertical'
}

const ResizablePanelHandle = ({
  className,
  direction = 'vertical',
  ...rest
}: ResizablePanelHandleProps) => (
  <PanelResizeHandle
    className={classNames(
      styles.handle,
      className,
      direction === 'vertical' ? styles.vertical : styles.horizontal,
    )}
    {...rest}
  />
)

export default ResizablePanelHandle
