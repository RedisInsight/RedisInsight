import { startCase } from 'lodash'
import React, { useContext } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { CodeButtonAutoExecute, CodeButtonParams, ExecuteButtonMode } from 'uiSrc/constants'
import { parseParams } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { getFileInfo, getTutorialSection, } from '../../utils'

import CodeButtonBlock from '../CodeButtonBlock'

export interface Props {
  label: string
  children: string
  params?: string
  path?: string
}

const Code = ({ children, params = '', label, path, ...rest }: Props) => {
  const { search } = useLocation()
  const { setScript, isCodeBtnDisabled } = useContext(EnablementAreaContext)
  const { instanceId } = useParams<{ instanceId: string }>()

  const parsedParams = parseParams(params)
  const mode = parsedParams?.auto === CodeButtonAutoExecute.true
    ? ExecuteButtonMode.Auto
    : ExecuteButtonMode.Manual

  const getFile = () => {
    const pagePath = new URLSearchParams(search).get('item')
    const manifestPath = new URLSearchParams(search).get('path')
    const file: { path?: string, name?: string, section?: string } = {}

    if (pagePath) {
      const pageInfo = getFileInfo({ path: pagePath })
      file.path = `${pageInfo.location}/${pageInfo.name}`
      file.name = startCase(label)
    }

    if (manifestPath) {
      file.section = getTutorialSection(manifestPath)
    }

    return file
  }

  const loadContent = (execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams }) => {
    const file = getFile()
    setScript(children, execute, { ...file, path })
  }

  const handleCopy = () => {
    const file = getFile()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_COMMAND_COPIED,
      eventData: {
        databaseId: instanceId,
        buttonName: label,
        path,
        ...file
      }
    })
  }

  return (
    <CodeButtonBlock
      className="mb-s mt-s"
      onClick={loadContent}
      onCopy={handleCopy}
      content={children}
      label={label}
      params={parsedParams}
      mode={mode}
      disabled={isCodeBtnDisabled}
      {...rest}
    />
  )
}

export default Code
