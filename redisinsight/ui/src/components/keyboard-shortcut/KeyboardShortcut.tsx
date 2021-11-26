import React from 'react'
import { isString } from 'lodash'
import cx from 'classnames'
import { EuiBadge, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[];
  separator?: string;
  transparent?: boolean;
}

const KeyboardShortcut = ({ items = [], separator = '', transparent = false }: Props) => (
  <div className={styles.container}>
    {
        items.map((item: string | JSX.Element, index: number) => (
          <div key={isString(item) ? item : item?.props?.children}>
            { (index !== 0) && <div className={styles.separator}>{separator}</div> }
            <EuiBadge className={cx(styles.badge, { [styles.transparent]: transparent })}>
              <EuiText size="s">{item}</EuiText>
            </EuiBadge>
          </div>
        ))
      }
  </div>
)
export default KeyboardShortcut
