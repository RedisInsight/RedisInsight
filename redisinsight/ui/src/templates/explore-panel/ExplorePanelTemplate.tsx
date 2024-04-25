import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { sidePanelsSelector } from 'uiSrc/slices/panels/sidePanels'
import SidePanels from 'uiSrc/components/side-panels'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
}

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName } = props
  const { openedPanel } = useSelector(sidePanelsSelector)

  return (
    <div className={styles.mainWrapper}>
      <div className={cx(styles.mainPanel, { insightsOpen: !!openedPanel })}>
        {children}
      </div>
      <div className={cx(styles.insigtsWrapper, { [styles.insightsOpen]: !!openedPanel })}>
        <SidePanels panelClassName={panelClassName} />
      </div>
    </div>
  )
}

export default React.memo(ExplorePanelTemplate)
