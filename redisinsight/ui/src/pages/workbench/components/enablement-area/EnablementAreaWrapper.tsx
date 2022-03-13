import React, { useEffect, useMemo } from 'react'
import { monaco } from 'react-monaco-editor'
import { omit, findKey } from 'lodash'
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import cx from 'classnames'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { Nullable, } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { fetchGuides, workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'
import { fetchTutorials, workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'

import EnablementArea from './EnablementArea'
import EnablementAreaCollapse from './EnablementAreaCollapse/EnablementAreaCollapse'
import { IInternalPage } from '../../contexts/enablementAreaContext'

import styles from './styles.module.scss'

export interface Props {
  isMinimized: boolean
  setIsMinimized: (value: boolean) => void
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  setScript: (script: string) => void
  isCodeBtnDisabled?: boolean
}

const sortItems = (guides: Record<string, IEnablementAreaItem>, tutorials: Record<string, IEnablementAreaItem>)
: Record<string, IEnablementAreaItem> => {
  const mergedItems = { ...guides, ...tutorials }
  const lastItemKey = findKey(mergedItems, { args: { order: 'last' } })

  if (lastItemKey) {
    return { ...omit(mergedItems, lastItemKey), lastItemKey: mergedItems[lastItemKey] }
  }

  return mergedItems
}

const EnablementAreaWrapper = ({ isMinimized, setIsMinimized, scriptEl, setScript, isCodeBtnDisabled }: Props) => {
  const { loading: loadingGuides, items: guides } = useSelector(workbenchGuidesSelector)
  const { loading: loadingTutorials, items: tutorials } = useSelector(workbenchTutorialsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchGuides())
  }, [])

  useEffect(() => {
    dispatch(fetchTutorials())
  }, [])

  // TODO: update it when tutorials repo will be finish
  const items = useMemo(() => sortItems(guides, tutorials), [guides, tutorials])

  const sendEventButtonClickedTelemetry = (data: Record<string, any>) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_COMMAND_CLICKED,
      eventData: {
        databaseId: instanceId,
        ...data,
      }
    })
  }

  const openScript = (script: string, path?: string, name?: string) => {
    sendEventButtonClickedTelemetry({ path, name })
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
      responsive={false}
      gutterSize="none"
      data-testid="enablement-area-container"
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
          loading={loadingGuides || loadingTutorials}
          openScript={openScript}
          onOpenInternalPage={onOpenInternalPage}
          isCodeBtnDisabled={isCodeBtnDisabled}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default React.memo(EnablementAreaWrapper)
