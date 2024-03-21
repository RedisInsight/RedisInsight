import { EuiButton, EuiForm, EuiFormRow, EuiSpacer, EuiSuperSelect, EuiText, EuiToolTip, } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { fetchPipelineStrategies, fetchPipelineTemplate, rdiPipelineStrategiesSelector } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

const NO_TEMPLATE = 'No template'

const NO_OPTIONS = [
  {
    value: 'no_template',
    inputDisplay: NO_TEMPLATE,
  }
]

const INGEST_OPTION = 'ingest'

export interface Props {
  setTemplate: (template: string) => void
  closePopover: () => void
  source: RdiPipelineTabs
  value: string
}

const getTooltipContent = (value: string, isNoTemplateOptions: boolean) => {
  if (isNoTemplateOptions) {
    return (
      <>
        No template is available.
        <br />
        Close the form and try again.
      </>
    )
  }

  if (value) {
    return 'Templates can be accessed only with the empty Editor to prevent potential data loss.'
  }

  return null
}

const TemplateForm = (props: Props) => {
  const { closePopover, setTemplate, source, value } = props

  const { loading, dbType, strategyType } = useSelector(rdiPipelineStrategiesSelector)

  const dbTypeOptions = dbType.map(({ value, label }) => ({ value, inputDisplay: label, }))
  const strategyTypeOptions = strategyType.map(({ value, label }) => ({ value, inputDisplay: label, }))

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const [selectedDbType, setSelectedDbType] = useState<string>('')
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')

  const dispatch = useDispatch()

  const handleCancel = () => {
    closePopover()
  }

  const onSuccess = (template: string) => {
    setTemplate(template)
    closePopover()
  }

  const handleApply = () => {
    const values = source === RdiPipelineTabs.Config
      ? { dbType: selectedDbType, strategyType: selectedStrategy }
      : { strategyType: selectedStrategy }

    dispatch(fetchPipelineTemplate(rdiInstanceId, values, onSuccess))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEMPLATE_CLICKED,
      eventData: {
        id: rdiInstanceId,
        page: source,
        mode: selectedStrategy,
      }
    })
  }

  const isNoTemplateOptions = source === RdiPipelineTabs.Config
    ? !dbType.length || !strategyType.length
    : !strategyType.length

  useEffect(() => {
    if (dbTypeOptions.length) {
      const initialSelectedOption = dbTypeOptions
        .find((option) => option.value === INGEST_OPTION)
        || dbTypeOptions[0]
      setSelectedDbType(initialSelectedOption.value)
    } else {
      setSelectedDbType(NO_OPTIONS[0].value)
    }

    if (strategyTypeOptions.length) {
      setSelectedStrategy(strategyTypeOptions[0].value)
    } else {
      setSelectedStrategy(NO_OPTIONS[0].value)
    }
  }, [dbType, strategyType])

  useEffect(() => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
  }, [])

  return (
    <div className={cx(styles.container)}>
      <EuiText className={styles.title}>Select a template</EuiText>
      <EuiSpacer size="s" />
      <EuiForm component="form">
        <EuiSpacer size="xs" />
        <EuiFormRow className={styles.formRow}>
          <>
            <div className={styles.rowLabel}>Pipeline type</div>
            <EuiSuperSelect
              options={strategyTypeOptions.length ? strategyTypeOptions : NO_OPTIONS}
              valueOfSelected={selectedStrategy}
              onChange={(value) => setSelectedStrategy(value)}
              popoverClassName={styles.selectWrapper}
              data-testid="strategy-type-select"
            />
          </>
        </EuiFormRow>
        {source === RdiPipelineTabs.Config && (
          <EuiFormRow className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>Database type</div>
              <EuiSuperSelect
                options={dbTypeOptions.length ? dbTypeOptions : NO_OPTIONS}
                valueOfSelected={selectedDbType}
                onChange={(value) => setSelectedDbType(value)}
                popoverClassName={styles.selectWrapper}
                data-testid="db-type-select"
              />
            </>
          </EuiFormRow>
        )}
      </EuiForm>
      <div className={styles.actions}>
        <EuiButton
          color="secondary"
          onClick={handleCancel}
          size="s"
          className={styles.btn}
          data-testid="template-cancel-btn"
        >
          Cancel
        </EuiButton>
        <EuiToolTip
          content={getTooltipContent(value, isNoTemplateOptions)}
          position="bottom"
          display="inlineBlock"
          className={styles.btn}
          anchorClassName="flex-row"
        >
          <EuiButton
            fill
            color="secondary"
            isDisabled={isNoTemplateOptions || !!value}
            onClick={handleApply}
            isLoading={loading}
            size="s"
            data-testid="template-apply-btn"
          >
            Apply
          </EuiButton>
        </EuiToolTip>
      </div>
    </div>
  )
}

export default TemplateForm
