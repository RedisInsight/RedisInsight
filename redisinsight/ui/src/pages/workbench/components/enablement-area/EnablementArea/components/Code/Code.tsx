import React, { useContext } from 'react'
import { startCase } from 'lodash'
import { useLocation } from 'react-router-dom'
import { parseParams, getFileInfo } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import CodeButton from '../CodeButton'

export interface Props {
  label: string
  children: string
  params?: string
  execute?: ExecuteButtonMode
}

const Code = ({ children, params, execute, ...rest }: Props) => {
  const { search } = useLocation()
  const { setScript, isCodeBtnDisabled } = useContext(EnablementAreaContext)

  const loadContent = (execute = ExecuteButtonMode.Manual, params?: CodeButtonParams) => {
    const pagePath = new URLSearchParams(search).get('item')
    if (pagePath) {
      const pageInfo = getFileInfo(pagePath)
      setScript(children, execute, params, `${pageInfo.location}/${pageInfo.name}`, startCase(rest.label))
    } else {
      setScript(children, execute, params)
    }
  }

  return (
    <CodeButton
      className="mb-s mt-s"
      onClick={loadContent}
      params={parseParams(params)}
      execute={execute}
      disabled={isCodeBtnDisabled}
      {...rest}
    />
  )
}

export default Code
