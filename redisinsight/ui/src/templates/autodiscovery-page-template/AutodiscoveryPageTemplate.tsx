import React from 'react'
import { PageHeader } from 'uiSrc/components'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import { Page, PageBody } from 'uiSrc/components/base/layout/page'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
      <PageHeader title="Redis databases" showInsights />
      <div />
      <ExplorePanelTemplate panelClassName={styles.explorePanel}>
        <Page className={styles.page}>
          <PageBody component="div">
            <div className="homePage">{children}</div>
          </PageBody>
        </Page>
      </ExplorePanelTemplate>
    </>
  )
}

export default AutodiscoveryPageTemplate
