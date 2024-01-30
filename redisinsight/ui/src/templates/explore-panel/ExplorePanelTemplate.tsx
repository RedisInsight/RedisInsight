import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { insightsPanelSelector } from 'uiSrc/slices/panels/insights'
import DatabaseSidePanels from 'uiSrc/components/database-side-panels'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
}

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName } = props
  const { isOpen: isInsightsOpen } = useSelector(insightsPanelSelector)

  return (
    <div className={styles.mainWrapper}>
      <div className={cx(styles.mainPanel, { insightsOpen: isInsightsOpen })}>
        {children}
      </div>
      <div className={cx(styles.insigtsWrapper, { [styles.insightsOpen]: isInsightsOpen })}>
        <DatabaseSidePanels panelClassName={panelClassName} />
      </div>
    </div>
  )
}

export default React.memo(ExplorePanelTemplate)
