import React, { useContext } from 'react'
import { EuiListGroupItem, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import styles from './styles.module.scss'
import './styles.scss'

export interface Props {
  testId: string
  label: string
  children: React.ReactElement[] | string
  path?: string
  size?: 's' | 'xs' | 'm' | 'l'
  iconType?: string
  iconPosition?: 'left' | 'right'
  toolTip?: string
  style?: any
  sourcePath: string
  manifestPath?: string
}
const InternalLink = (props: Props) => {
  const {
    label,
    testId,
    children,
    path = '',
    size = 's',
    iconType,
    iconPosition = 'left',
    toolTip,
    sourcePath,
    manifestPath,
    ...rest
  } = props
  const { openPage } = useContext(EnablementAreaContext)
  const handleOpenPage = () => {
    if (path) {
      openPage({ path: sourcePath, manifestPath, label })
    }
  }

  const content = (
    <EuiToolTip content={toolTip} anchorClassName={styles.content}>
      <>{children || label}</>
    </EuiToolTip>
  )
  return (
    <EuiListGroupItem
      data-testid={`internal-link-${testId}`}
      className={cx(
        styles.link,
        iconPosition === 'right' && styles.linkIconRight
      )}
      iconType={iconType}
      size={size}
      wrapText
      color="subdued"
      onClick={handleOpenPage}
      label={content}
      {...rest}
    />
  )
}

export default InternalLink
