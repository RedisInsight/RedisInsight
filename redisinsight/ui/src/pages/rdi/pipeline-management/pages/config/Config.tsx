import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get, throttle } from 'lodash'

import { sendPageViewTelemetry, sendEventTelemetry, TelemetryPageView, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { rdiPipelineSelector, setChangedFile, deleteChangedFile } from 'uiSrc/slices/rdi/pipeline'
import { FileChangeType, IPipeline, RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import MonacoYaml from 'uiSrc/components/monaco-editor/components/monaco-yaml'
import TestConnectionsPanel from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-panel'
import TemplatePopover from 'uiSrc/pages/rdi/pipeline-management/components/template-popover'
import { rdiErrorMessages } from 'uiSrc/pages/rdi/constants'
import { testConnectionsAction, rdiTestConnectionsSelector, testConnectionsController } from 'uiSrc/slices/rdi/testConnections'
import { appContextPipelineManagement } from 'uiSrc/slices/app/context'
import { createAxiosError, isEqualPipelineFile, yamlToJson } from 'uiSrc/utils'

import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import styles from './styles.module.scss'

const Config = () => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const { loading: pipelineLoading, schema, data } = useSelector(rdiPipelineSelector)
  const { loading: testingConnections } = useSelector(rdiTestConnectionsSelector)
  const { isOpenDialog } = useSelector(appContextPipelineManagement)

  const { values: { config = '' }, setFieldValue } = useFormikContext<IPipeline>()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_CONFIG,
      eventData: {
        rdiInstanceId
      }
    })

    return () => {
      testConnectionsController?.abort()
    }
  }, [])

  useEffect(() => {
    if (isOpenDialog || pipelineLoading) return

    if (!config) {
      setIsPopoverOpen(true)
    }

    if (config) {
      setIsPopoverOpen(false)
    }
  }, [isOpenDialog, config, pipelineLoading])

  const testConnections = () => {
    const JSONValue = yamlToJson(config, (msg) => {
      dispatch(addErrorNotification(createAxiosError({
        message: rdiErrorMessages.invalidStructure('config', msg)
      })))
    })
    if (!JSONValue) {
      return
    }
    setIsPanelOpen(true)
    dispatch(testConnectionsAction(rdiInstanceId, JSONValue))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_TARGET_CONNECTIONS_CLICKED,
      eventData: {
        id: rdiInstanceId,
      }
    })
  }

  const checkIsFileUpdated = useCallback(throttle((value) => {
    if (!data) {
      dispatch(setChangedFile({ name: 'config', status: FileChangeType.Added }))
      return
    }

    if (isEqualPipelineFile(value, data?.config)) {
      dispatch(deleteChangedFile('config'))
      return
    }

    dispatch(setChangedFile({ name: 'config', status: FileChangeType.Modified }))
  }, 2000), [data])

  const handleChange = useCallback((value: string) => {
    setFieldValue('config', value)
    checkIsFileUpdated(value)
  }, [data])

  const handleClosePanel = () => {
    testConnectionsController?.abort()
    setIsPanelOpen(false)
  }

  return (
    <>
      <div className={cx('content', 'rdi__wrapper', { [styles.isPanelOpen]: isPanelOpen })}>
        <div className="rdi__content-header">
          <EuiText className="rdi__title">Target database configuration</EuiText>
          <TemplatePopover
            isPopoverOpen={isPopoverOpen && !isOpenDialog}
            setIsPopoverOpen={setIsPopoverOpen}
            value={config}
            setFieldValue={(template) => setFieldValue('config', template)}
            loading={pipelineLoading}
            source={RdiPipelineTabs.Config}
          />
        </div>
        <EuiText className="rdi__text" color="subdued">
          {'Configure target instance '}
          <EuiLink
            external={false}
            data-testid="rdi-pipeline-config-link"
            target="_blank"
            href={getUtmExternalLink(
              EXTERNAL_LINKS.rdiPipeline,
              {
                medium: UTM_MEDIUMS.Rdi,
                campaign: 'config_file'
              }
            )}
          >
            connection details
          </EuiLink>
          {' and applier settings.'}
        </EuiText>
        {pipelineLoading ? (
          <div className={cx('rdi__editorWrapper', 'rdi__loading')} data-testid="rdi-config-loading">
            <EuiText color="subdued" style={{ marginBottom: 12 }}>Loading data...</EuiText>
            <EuiLoadingSpinner color="secondary" size="l" />
          </div>
        ) : (
          <MonacoYaml
            schema={get(schema, 'config', null)}
            value={config}
            onChange={handleChange}
            disabled={pipelineLoading}
            wrapperClassName="rdi__editorWrapper"
            data-testid="rdi-monaco-config"
          />
        )}
        <div className="rdi__actions">
          <EuiButton
            fill
            color="secondary"
            size="s"
            onClick={testConnections}
            isLoading={testingConnections || pipelineLoading}
            aria-labelledby="test target connections"
            data-testid="rdi-test-connection-btn"
          >
            Test Connection
          </EuiButton>
        </div>
      </div>
      {isPanelOpen && (
        <TestConnectionsPanel onClose={handleClosePanel} />
      )}
    </>
  )
}

export default React.memo(Config)
