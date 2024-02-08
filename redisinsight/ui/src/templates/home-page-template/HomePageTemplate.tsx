import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import InsightsTrigger from 'uiSrc/components/insights-trigger'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import HomeTabs from 'uiSrc/components/home-tabs'

import { BuildType } from 'uiSrc/constants/env'
import { PageHeader } from 'uiSrc/components'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const HomePageTemplate = (props: Props) => {
  const { children } = props
  const { server } = useSelector(appInfoSelector)

  const HomeHeader = useCallback(() => (server?.buildType === BuildType.RedisStack ? (
    <PageHeader
      title="My Redis databases"
      className={styles.pageHeader}
      logo={(
        <InsightsTrigger source="home page" />
      )}
    />
  ) : (
    <div className={styles.pageDefaultHeader}>
      <HomeTabs />
      <InsightsTrigger source="home page" />
    </div>
  )), [server])

  return (
    <>
      <HomeHeader />
      <div className={styles.pageWrapper}>
        <ExplorePanelTemplate panelClassName={styles.explorePanel}>
          {children}
        </ExplorePanelTemplate>
      </div>
    </>
  )
}

export default React.memo(HomePageTemplate)
