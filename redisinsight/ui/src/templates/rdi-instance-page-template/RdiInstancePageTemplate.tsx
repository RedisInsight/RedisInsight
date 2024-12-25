import React from 'react'
import { ExplorePanelTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiInstancePageTemplate = (props: Props) => {
  const { children } = props

  return (
    <div className={styles.content}>
      <ExplorePanelTemplate>
        {children}
      </ExplorePanelTemplate>
    </div>

  )
}

export default RdiInstancePageTemplate
