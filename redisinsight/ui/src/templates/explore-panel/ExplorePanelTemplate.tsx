import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { insightsPanelSelector } from 'uiSrc/slices/panels/insights'
import DatabaseSidePanels from 'uiSrc/components/database-side-panels'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
  withOverview?: boolean
}

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName, withOverview } = props
  const { isOpen: isInsightsOpen } = useSelector(insightsPanelSelector)

  return (
    <div className={cx(styles.mainWrapper, { [styles.withOverview]: withOverview })}>
      <div className={cx(styles.mainPanel, { [styles.insightsOpen]: isInsightsOpen })}>
        {children}
      </div>
      <DatabaseSidePanels panelClassName={panelClassName} />
    </div>
  )
}

export default ExplorePanelTemplate
