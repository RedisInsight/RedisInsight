import { startCase } from 'lodash'
import React, { useContext } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { CodeButtonParams } from 'uiSrc/constants'
import { parseParams } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { getFileInfo, getTutorialSection, } from '../../utils'

import CodeButtonBlock from '../CodeButtonBlock'

export interface Props {
  label: string
  children: string
  params?: string
  path?: string
}

const Code = ({ children, params = '', label, path, ...rest }: Props) => {
  const { provider, modules = [] } = useSelector(connectedInstanceSelector)

  const { search } = useLocation()
  const { setScript } = useContext(EnablementAreaContext)
  const { instanceId } = useParams<{ instanceId: string }>()
  const parsedParams = parseParams(params)

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

  const loadContent = (params?: CodeButtonParams, onFinish?: () => void) => {
    setScript(children, params, onFinish)

    const file = getFile()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: instanceId,
        path,
        provider,
        ...file
      }
    })
  }

  const onCopyClicked = () => {
    const file = getFile()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_COMMAND_COPIED,
      eventData: {
        databaseId: instanceId,
        buttonName: label,
        path,
        provider,
        ...file
      }
    })
  }

  return (
    <CodeButtonBlock
      className="mb-s mt-s"
      onApply={loadContent}
      onCopy={onCopyClicked}
      content={children}
      modules={modules}
      label={label}
      params={parsedParams}
      {...rest}
    />
  )
}

export default Code
