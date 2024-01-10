import React from 'react'

import RdiPipelineHeader from 'uiSrc/pages/rdi/pipeline/components/header'
import Navigation from 'uiSrc/pages/rdi/pipeline/components/navigation'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const RdiPipelinePageTemplate = (props: Props) => {
  const { children } = props

  // TODO add side panel logs
  return (
    <>
      <RdiPipelineHeader />
      <div className={styles.wrapper}>
        <Navigation />
        {children}
      </div>
    </>
  )
}

export default RdiPipelinePageTemplate
