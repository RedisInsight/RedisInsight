import React, { useContext } from 'react'
import { EuiListGroupItem, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import styles from './styles.module.scss'
import './styles.scss'

export interface Props {
  testId: string,
  label: string;
  children: React.ReactElement[] | string;
  path?: string,
  backTitle?: string;
  size?: 's' | 'xs' | 'm' | 'l';
  iconType?: string;
  iconPosition?: 'left' | 'right';
  toolTip?: string;
}
const InternalLink = (props: Props) => {
  const { label, testId, children, backTitle = '', path = '', size = 's', iconType, iconPosition = 'left', toolTip } = props
  const { openPage } = useContext(EnablementAreaContext)
  const handleOpenPage = () => {
    if (path) {
      openPage({ path, label, backTitle: backTitle || label })
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
    />
  )
}

export default InternalLink
