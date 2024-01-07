import React from 'react'

import RdiPipelineHeader from 'uiSrc/pages/rdi/pipeline/components/header'

export interface Props {
  children: React.ReactNode
}

const RdiPipelinePageTemplate = (props: Props) => {
  const { children } = props

  // TODO add side panel logs
  return (
    <>
      <RdiPipelineHeader />
      {children}
    </>
  )
}

export default RdiPipelinePageTemplate
