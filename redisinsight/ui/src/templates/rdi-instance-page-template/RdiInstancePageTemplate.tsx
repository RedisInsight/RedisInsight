import React from 'react'
import RdiInstanceHeader from 'uiSrc/components/rdi-instance-header'
import { ExplorePanelTemplate } from 'uiSrc/templates'

export interface Props {
  children: React.ReactNode
}

const RdiInstancePageTemplate = (props: Props) => {
  const { children } = props

  return (
    <>
      <RdiInstanceHeader />
      <ExplorePanelTemplate>
        {children}
      </ExplorePanelTemplate>
    </>
  )
}

export default RdiInstancePageTemplate
