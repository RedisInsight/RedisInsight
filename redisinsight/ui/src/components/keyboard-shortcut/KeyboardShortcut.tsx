import React from 'react'
import { isString } from 'lodash'
import cx from 'classnames'
import { EuiBadge, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[]
  separator?: string
  transparent?: boolean
  badgeTextClassName?: string
}

const KeyboardShortcut = (props: Props) => {
  const {
    items = [],
    separator = '',
    transparent = false,
    badgeTextClassName = '',
  } = props
  return (
    <div className={styles.container}>
      {items.map((item: string | JSX.Element, index: number) => (
        <div key={isString(item) ? item : item?.props?.children}>
          {index !== 0 && <div className={styles.separator}>{separator}</div>}
          <EuiBadge
            className={cx(styles.badge, { [styles.transparent]: transparent })}
          >
            <EuiText className={badgeTextClassName} size="s">
              {item}
            </EuiText>
          </EuiBadge>
        </div>
      ))}
    </div>
  )
}
export default KeyboardShortcut
