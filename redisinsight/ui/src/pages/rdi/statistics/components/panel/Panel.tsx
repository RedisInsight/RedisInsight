import { EuiPanel } from '@elastic/eui'
import React from 'react'

import styles from './styles.module.scss'

interface Props {
  children: string | JSX.Element
  paddingSize?: 's' | 'none' | 'm' | 'l'
}

const Panel = ({ children, paddingSize = 'm' }: Props) => (
  <EuiPanel className={styles.panel} hasBorder={false} hasShadow={false} paddingSize={paddingSize}>
    {children}
  </EuiPanel>
)

export default Panel
