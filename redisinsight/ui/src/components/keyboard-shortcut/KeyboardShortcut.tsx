import React from 'react'
import { EuiBadge, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  items: string[],
  separator?: string
}

const KeyboardShortcut = ({ items = [], separator = '' }: Props) => (
  <div className={styles.container}>
    {
        items.map((item: string, index: number) => (
          <div key={item}>
            { (index !== 0) && <div className={styles.separator}>{separator}</div> }
            <EuiBadge className={styles.badge}>
              <EuiText size="s">{item}</EuiText>
            </EuiBadge>
          </div>
        ))
      }
  </div>
)
export default KeyboardShortcut
