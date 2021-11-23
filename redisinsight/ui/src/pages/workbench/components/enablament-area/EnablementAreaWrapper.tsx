import React, { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Nullable, } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchEnablementArea, workbenchEnablementAreaSelector } from 'uiSrc/slices/workbench/wb-enablement-area'

import EnablementArea from './EnablementArea'
import { IInternalPage } from '../../contexts/enablementAreaContext'

export interface Props {
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>;
  setScript: (script: string) => void;
}

const EnablementAreaWrapper = React.memo(({ scriptEl, setScript }: Props) => {
  const { loading, items } = useSelector(workbenchEnablementAreaSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchEnablementArea())
  }, [])

  const sendEventButtonClickedTelemetry = (path: string = '') => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_COMMAND_CLICKED,
      eventData: {
        path,
        databaseId: instanceId,
      }
    })
  }

  const openScript = (script: string, path: string) => {
    sendEventButtonClickedTelemetry(path)
    setScript(script)

    setTimeout(() => {
      scriptEl?.focus()
      scriptEl?.setSelection(new monaco.Selection(0, 0, 0, 0))
    }, 0)
  }

  const openInternalPage = ({ path }: IInternalPage) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_GUIDE_OPENED,
      eventData: {
        path,
        databaseId: instanceId,
      }
    })
  }

  return (
    <EnablementArea
      items={items}
      loading={loading}
      openScript={openScript}
      openInternalPage={openInternalPage}
    />
  )
})

export default EnablementAreaWrapper
