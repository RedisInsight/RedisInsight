import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui'
import cx from 'classnames'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
import React, { useEffect } from 'react'
import { monaco } from 'react-monaco-editor'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { fetchGuides, workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'
import { fetchTutorials, workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { fetchCustomTutorials, workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Nullable, } from 'uiSrc/utils'

import { setWorkbenchEAMinimized } from 'uiSrc/slices/app/context'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { getTutorialSection } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils'
import EnablementArea from './EnablementArea'
import EnablementAreaCollapse from './EnablementAreaCollapse/EnablementAreaCollapse'

import styles from './styles.module.scss'

export interface Props {
  isMinimized: boolean
  scriptEl: Nullable<monacoEditor.editor.IStandaloneCodeEditor>
  setScript: (script: string) => void
  onSubmit: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  isCodeBtnDisabled?: boolean
}

const EnablementAreaWrapper = (props: Props) => {
  const { isMinimized, scriptEl, setScript, isCodeBtnDisabled, onSubmit } = props
  const { loading: loadingGuides, items: guides } = useSelector(workbenchGuidesSelector)
  const { loading: loadingTutorials, items: tutorials } = useSelector(workbenchTutorialsSelector)
  const { loading: loadingCustomTutorials, items: customTutorials } = useSelector(workbenchCustomTutorialsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchGuides())
    dispatch(fetchTutorials())
    dispatch(fetchCustomTutorials())
  }, [])

  const sendEventButtonClickedTelemetry = (data?: Record<string, any>) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_COMMAND_CLICKED,
      eventData: {
        databaseId: instanceId,
        ...data,
      }
    })
  }

  const openScript = (
    script: string,
    execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams } = { mode: ExecuteButtonMode.Manual },
    file?: { path?: string, name?: string, source?: string }
  ) => {
    sendEventButtonClickedTelemetry(file)

    if (execute.mode === ExecuteButtonMode.Auto) {
      onSubmit(script, null, { ...execute.params, clearEditor: false })
      return
    }

    setScript(script)
    setTimeout(() => {
      scriptEl?.focus()
      scriptEl?.setSelection(new monaco.Selection(0, 0, 0, 0))
    }, 0)
  }

  const onOpenInternalPage = ({ path, manifestPath }: IInternalPage) => {
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_GUIDE_OPENED,
      eventData: {
        path,
        section: getTutorialSection(manifestPath),
        databaseId: instanceId,
      }
    })
  }

  const handleExpandCollapse = (value: boolean) => {
    dispatch(setWorkbenchEAMinimized(value))
  }

  return (
    <EuiFlexGroup
      className={cx(styles.areaWrapper, { [styles.minimized]: isMinimized })}
      onClick={() => isMinimized && handleExpandCollapse(false)}
      direction="column"
      responsive={false}
      gutterSize="none"
      data-testid="enablement-area-container"
    >
      <EuiFlexItem
        className={cx(styles.collapseWrapper, { [styles.minimized]: isMinimized })}
        grow={isMinimized}
      >
        <EnablementAreaCollapse isMinimized={isMinimized} setIsMinimized={handleExpandCollapse} />
      </EuiFlexItem>

      <EuiFlexItem
        className={cx(styles.areaContentWrapper, { [styles.minimized]: isMinimized })}
        grow={!isMinimized}
      >
        <EnablementArea
          guides={guides}
          tutorials={tutorials}
          customTutorials={customTutorials}
          loading={loadingGuides || loadingTutorials || loadingCustomTutorials}
          openScript={openScript}
          onOpenInternalPage={onOpenInternalPage}
          isCodeBtnDisabled={isCodeBtnDisabled}
        />
      </EuiFlexItem>
      <OnboardingTour
        options={ONBOARDING_FEATURES.WORKBENCH_ENABLEMENT_GUIDE}
        anchorPosition="rightUp"
        anchorWrapperClassName={styles.onboardingAnchor}
        preventPropagation
      >
        <span />
      </OnboardingTour>
    </EuiFlexGroup>
  )
}

export default React.memo(EnablementAreaWrapper)
