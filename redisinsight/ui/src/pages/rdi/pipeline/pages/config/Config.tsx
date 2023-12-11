import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import cx from 'classnames'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { MonacoYaml } from 'uiSrc/components/monaco-editor'

import styles from './styles.module.scss'

const Config = () => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const [value, setValue] = useState<string>(data?.config ?? '')

  useEffect(() => {
    setValue(data?.config ?? '')
  }, [data])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_CONFIG,
    })
  }, [])

  return (
    <div className={cx('content', styles.wrapper)}>
      <EuiText className={styles.title}>Target database configuration</EuiText>
      <EuiText className={styles.text} color="subdued">
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
      {loading ? (
        <div className={cx(styles.editorWrapper, styles.loading)} data-testid="rdi-config-loading">
          <EuiText color="subdued" style={{ marginBottom: 12 }}>Loading data...</EuiText>
          <EuiLoadingSpinner color="secondary" size="l" />
        </div>
      ) : (
        <MonacoYaml
          value={value}
          onChange={setValue}
          disabled={loading}
          wrapperClassName={styles.editorWrapper}
          data-testid="rdi-config"
        />
      )}

      <div className={styles.actions}>
        <EuiButton
          fill
          color="secondary"
          size="s"
          onClick={() => {}}
          data-testid="rdi-test-connection"
        >
          Test Connection
        </EuiButton>
      </div>
    </div>
  )
}

export default Config
