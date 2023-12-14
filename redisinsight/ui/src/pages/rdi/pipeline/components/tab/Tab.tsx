import React from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'
import {EuiIcon, EuiText} from "@elastic/eui";

export interface IProps {
  title: string | JSX.Element
  isSelected: boolean
  className?: string
  fileName?: string
  children?: React.ReactElement | string
  testID?: string
}

const Tab = (props: IProps) => {
  const {
    title,
    isSelected,
    children,
    fileName,
    testID,
    className,
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
        </div>
      ) : children}
    </div>
  )
}

export default Tab
