import React, { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import cx from 'classnames'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Nullable, } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchEnablementArea, workbenchEnablementAreaSelector } from 'uiSrc/slices/workbench/wb-enablement-area'

import EnablementArea from './EnablementArea'
import EnablementAreaCollapse from './EnablementAreaCollapse/EnablementAreaCollapse'
import { IInternalPage } from '../../contexts/enablementAreaContext'

import styles from './styles.module.scss'

export interface Props {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>;
  setScript: (script: string) => void;
}

const EnablementAreaWrapper = React.memo(({ isMinimized, setIsMinimized, scriptEl, setScript }: Props) => {
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

  const onOpenInternalPage = ({ path }: IInternalPage) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_GUIDE_OPENED,
      eventData: {
        path,
        databaseId: instanceId,
      }
    })
  }

  return (
    <EuiFlexGroup
      className={cx(styles.areaWrapper, { [styles.minimized]: isMinimized })}
      onClick={() => isMinimized && setIsMinimized(false)}
      direction="column"
      gutterSize="none"
    >
      <EuiFlexItem
        className={cx(styles.collapseWrapper, { [styles.minimized]: isMinimized })}
        grow={isMinimized}
      >
        <EnablementAreaCollapse isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      </EuiFlexItem>
      <EuiFlexItem
        className={cx(styles.areaContentWrapper, { [styles.minimized]: isMinimized })}
        grow={!isMinimized}
      >
        <EnablementArea
          items={items}
          loading={loading}
          openScript={openScript}
          onOpenInternalPage={onOpenInternalPage}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
})

export default EnablementAreaWrapper
