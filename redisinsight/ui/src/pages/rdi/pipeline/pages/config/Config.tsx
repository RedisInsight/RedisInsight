import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { EuiText, EuiLink, EuiButton, EuiLoadingSpinner } from '@elastic/eui'
import { useFormikContext } from 'formik'
import cx from 'classnames'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IPipeline } from 'uiSrc/slices/interfaces'
import { MonacoYaml } from 'uiSrc/components/monaco-editor'

const Config = () => {
  const { loading } = useSelector(rdiPipelineSelector)

  const { values, setFieldValue } = useFormikContext<IPipeline>()

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_CONFIG,
    })
  }, [])

  return (
    <div className={cx('content', 'rdi__wrapper')}>
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
      {loading ? (
        <div className={cx('rdi__editorWrapper', 'rdi__loading')} data-testid="rdi-config-loading">
          <EuiText color="subdued" style={{ marginBottom: 12 }}>Loading data...</EuiText>
          <EuiLoadingSpinner color="secondary" size="l" />
        </div>
      ) : (
        <MonacoYaml
          value={values?.config ?? ''}
          onChange={(value) => setFieldValue('config', value)}
          disabled={loading}
          wrapperClassName="rdi__editorWrapper"
          data-testid="rdi-config"
        />
      )}

      <div className="rdi__actions">
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
