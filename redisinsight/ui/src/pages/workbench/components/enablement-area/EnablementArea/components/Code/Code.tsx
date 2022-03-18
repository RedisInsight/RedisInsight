import React, { useContext } from 'react'
import { startCase } from 'lodash'
import { useLocation } from 'react-router-dom'

import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { getFileInfo } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils/getFileInfo'

import CodeButton from '../CodeButton'

export interface Props {
  label: string;
  children: string;
}

const Code = ({ children, ...rest }: Props) => {
  const { search } = useLocation()
  const { setScript, isCodeBtnDisabled } = useContext(EnablementAreaContext)

  const loadContent = () => {
    const pagePath = new URLSearchParams(search).get('guide')
    if (pagePath) {
      const pageInfo = getFileInfo(pagePath)
      setScript(children, `${pageInfo.location}/${pageInfo.name}`, startCase(rest.label))
    } else {
      setScript(children)
    }
  }

  return (
    <CodeButton className="mb-s mt-s" onClick={loadContent} disabled={isCodeBtnDisabled} {...rest} />
  )
}

export default Code
