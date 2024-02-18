import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import { sendPageViewTelemetry, sendEventTelemetry, TelemetryPageView, TelemetryEvent } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { MonacoYaml } from 'uiSrc/components/monaco-editor'
import TestConnectionsPanel from 'uiSrc/pages/rdi/pipeline/components/test-connections-panel'
import { testConnectionsAction, rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import styles from './styles.module.scss'

const Config = () => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)

  const { loading: pipelineLoading } = useSelector(rdiPipelineSelector)
  const { loading: testingConnections } = useSelector(rdiTestConnectionsSelector)

  const { values: { config = '' }, setFieldValue } = useFormikContext<IPipeline>()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const dispatch = useDispatch()

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_CONFIG,
    })
  }, [])

  const testConnections = () => {
    setIsPanelOpen(true)
    dispatch(testConnectionsAction(rdiInstanceId, config))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEST_TARGET_CONNECTIONS_CLICKED,
      eventData: {
        id: rdiInstanceId,
      }
    })
  }

  return (
    <>
      <div className={cx('content', 'rdi__wrapper', { [styles.isPanelOpen]: isPanelOpen })}>
        <EuiText className="rdi__title">Target database configuration</EuiText>
        <EuiText className="rdi__text" color="subdued">
          {'Configure target instance '}
          <EuiLink
            external={false}
            data-testid="rdi-pipeline-config-link"
            target="_blank"
            href={EXTERNAL_LINKS.rdiQuickStart}
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
            value={config}
            onChange={(value) => setFieldValue('config', value)}
            disabled={pipelineLoading}
            wrapperClassName="rdi__editorWrapper"
            data-testid="rdi-config"
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
        <TestConnectionsPanel onClose={() => setIsPanelOpen(false)} />
      )}
    </>
  )
}

export default Config
