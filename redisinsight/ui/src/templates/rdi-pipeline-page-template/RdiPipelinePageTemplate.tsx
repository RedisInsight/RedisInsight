import React from 'react'
import { Form } from 'formik'

import RdiPipelineHeader from 'uiSrc/pages/rdi/pipeline-management/components/header'
import Navigation from 'uiSrc/pages/rdi/pipeline-management/components/navigation'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiPipelinePageTemplate = (props: Props) => {
  const { children } = props

  // TODO add side panel logs
  return (
    <Form className={styles.fullHeight}>
      <RdiPipelineHeader />
      <div className={styles.wrapper}>
        <Navigation />
        {children}
      </div>
    </Form>
  )
}

export default RdiPipelinePageTemplate
