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
      className,
      direction === 'vertical' ? styles.vertical : styles.horizontal,
    )}
    {...rest}
  >
    <div
      className={classNames(
        styles.handle,
        direction === 'vertical' ? styles.vertical : '',
      )}
    >
      <div className={styles.line} />
      <div className={styles.line} />
    </div>
  </PanelResizeHandle>
)

export default ResizablePanelHandle
