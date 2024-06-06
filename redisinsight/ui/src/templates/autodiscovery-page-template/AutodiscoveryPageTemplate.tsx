import React from 'react'
import { EuiPage, EuiPageBody } from '@elastic/eui'
import { PageHeader } from 'uiSrc/components'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
      <PageHeader title="My Redis databases" showInsights />
      <div />
      <ExplorePanelTemplate panelClassName={styles.explorePanel}>
        <EuiPage className={styles.page}>
          <EuiPageBody component="div">
            <div className="homePage">
              {children}
            </div>
          </EuiPageBody>
        </EuiPage>
      </ExplorePanelTemplate>
    </>
  )
}

export default AutodiscoveryPageTemplate
