import { startCase } from 'lodash'
import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { getFileInfo, parseParams } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { Maybe } from 'uiSrc/utils'

import CodeButton from '../CodeButton'

export interface Props {
  label: string
  children: string
  params?: string
  mode?: ExecuteButtonMode
}

const Code = ({ children, params, mode, ...rest }: Props) => {
  const { search } = useLocation()
  const { setScript, isCodeBtnDisabled } = useContext(EnablementAreaContext)

  const loadContent = (execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams }) => {
    const pagePath = new URLSearchParams(search).get('item')
    let file: Maybe<{ path: string, name: string }>

    if (pagePath) {
      const pageInfo = getFileInfo(pagePath)
      file = {
        path: `${pageInfo.location}/${pageInfo.name}`,
        name: startCase(rest.label)
      }
    }

    setScript(children, execute, file)
  }

  return (
    <CodeButton
      className="mb-s mt-s"
      onClick={loadContent}
      params={parseParams(params)}
      mode={mode}
      disabled={isCodeBtnDisabled}
      {...rest}
    />
  )
}

export default Code
