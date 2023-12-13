import React from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export interface IProps {
  isSelected: boolean
  className?: string
  children: React.ReactElement | string
  testID?: string
}

const Tab = (props: IProps) => {
  const { isSelected, children, testID, className } = props

  return (
    <div
      className={cx(styles.wrapper, className, { [styles.active]: isSelected })}
      data-testid={testID}
    >
      {children}
    </div>
  )
}

export default Tab
