import React from 'react'
import { Form } from 'formik'

import RdiInstanceHeader from 'uiSrc/components/rdi-instance-header'
import RdiPipelineManagementHeader from 'uiSrc/pages/rdi/pipeline-management/components/header'
import Navigation from 'uiSrc/pages/rdi/pipeline-management/components/navigation'
import { ExplorePanelTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiPipelineManagementTemplate = (props: Props) => {
  const { children } = props

  // TODO add side panel logs
  return (
    <Form className={styles.form}>
      <div>
        <RdiInstanceHeader />
        <RdiPipelineManagementHeader />
      </div>
      <div className={styles.content}>
        <ExplorePanelTemplate>
          <div className={styles.wrapper}>
            <Navigation />
            {children}
          </div>
        </ExplorePanelTemplate>
      </div>
    </Form>
  )
}

export default RdiPipelineManagementTemplate
