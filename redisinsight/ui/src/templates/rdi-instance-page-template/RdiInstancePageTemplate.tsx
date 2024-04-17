import React from 'react'
import RdiInstanceHeader from 'uiSrc/components/rdi-instance-header'
import { ExplorePanelTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiInstancePageTemplate = (props: Props) => {
  const { children } = props

  return (
    <div className={styles.page}>
      <RdiInstanceHeader />
      <div className={styles.content}>
        <ExplorePanelTemplate>
          {children}
        </ExplorePanelTemplate>
      </div>
    </div>
  )
}

export default RdiInstancePageTemplate
