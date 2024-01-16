import React from 'react'
import cx from 'classnames'
import { EuiIcon, EuiLoadingSpinner, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface IProps {
  title: string | JSX.Element
  isSelected: boolean
  className?: string
  fileName?: string
  children?: React.ReactElement | string
  testID?: string
  isSpinner?: boolean
}

const Tab = (props: IProps) => {
  const {
    title,
    isSelected,
    children,
    fileName,
    testID,
    className,
    isSpinner,
  } = props

  return (
    <div
      className={cx(styles.wrapper, className, { [styles.active]: isSelected })}
      data-testid={testID}
    >
      <EuiText className="rdi-pipeline-nav__title" size="m">{title}</EuiText>
      {fileName ? (
        <div
          className="rdi-pipeline-nav__file"
        >
          <EuiIcon type="document" className="rdi-pipeline-nav__fileIcon" />
          <EuiText className="rdi-pipeline-nav__text">{fileName}</EuiText>
          {isSpinner && <EuiLoadingSpinner data-testid="rdi-nav-config-loader" className={styles.loader} />}
        </div>
      ) : children}
    </div>
  )
}

export default Tab
