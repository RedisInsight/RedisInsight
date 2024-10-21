import {
  EuiButton,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSuperSelect,
  EuiText,
  EuiToolTip,
  EuiSuperSelectOption,
} from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  fetchPipelineStrategies,
  fetchJobTemplate,
  fetchConfigTemplate,
  rdiPipelineStrategiesSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { NO_TEMPLATE_VALUE, NO_OPTIONS, INGEST_OPTION } from './constants'

import styles from './styles.module.scss'

export interface Props {
  setTemplate: (template: string) => void
  closePopover: () => void
  source: RdiPipelineTabs
  value: string
}

export const getTooltipContent = (value: string, isNoTemplateOptions: boolean) => {
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

  const { loading, data } = useSelector(rdiPipelineStrategiesSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const [pipelineTypeOptions, setPipelineTypeOptions] = useState<EuiSuperSelectOption<string>[]>([])
  const [dbTypeOptions, setDbTypeOptions] = useState<EuiSuperSelectOption<string>[]>(NO_OPTIONS)
  const [selectedDbType, setSelectedDbType] = useState<string>('')
  const [selectedPipelineType, setSelectedPipelineType] = useState<string>('')

  const dispatch = useDispatch()

  const handleCancel = () => {
    closePopover()
  }

  const onSuccess = (template: string) => {
    setTemplate(template)
    closePopover()
  }

  const handleApply = () => {
    if (source === RdiPipelineTabs.Config) {
      dispatch(fetchConfigTemplate(rdiInstanceId, selectedPipelineType, selectedDbType, onSuccess))
    }
    if (source === RdiPipelineTabs.Jobs) {
      dispatch(fetchJobTemplate(rdiInstanceId, selectedPipelineType, onSuccess))
    }
    sendEventTelemetry({
      event: TelemetryEvent.RDI_TEMPLATE_CLICKED,
      eventData: {
        id: rdiInstanceId,
        page: source,
        mode: selectedPipelineType,
      }
    })
  }

  const isNoTemplateOptions = source === RdiPipelineTabs.Config
    ? selectedDbType === NO_TEMPLATE_VALUE || selectedPipelineType === NO_TEMPLATE_VALUE
    : selectedPipelineType === NO_TEMPLATE_VALUE

  useEffect(() => {
    if (!selectedPipelineType || !data.length) {
      setDbTypeOptions(NO_OPTIONS)
      setSelectedDbType(NO_OPTIONS[0].value)

      return
    }

    const selectedStrategy = data
      .find(({ strategy }) => strategy === selectedPipelineType)

    const newDbTypeOptions = selectedStrategy?.databases?.map((db) => ({ value: db, inputDisplay: db }))

    if (newDbTypeOptions?.length) {
      setDbTypeOptions(newDbTypeOptions)
      setSelectedDbType(newDbTypeOptions[0].value)
    } else {
      setDbTypeOptions(NO_OPTIONS)
      setSelectedDbType(NO_OPTIONS[0].value)
    }
  }, [data, selectedPipelineType])

  useEffect(() => {
    const newPipelineTypeOptions = data.map((strategy) => ({
      value: strategy.strategy,
      inputDisplay: strategy.strategy,
    }))

    setPipelineTypeOptions(newPipelineTypeOptions.length ? newPipelineTypeOptions : NO_OPTIONS)

    if (data?.length) {
      const initialSelectedOption = newPipelineTypeOptions
        .find((strategy) => strategy.value === INGEST_OPTION)
          || newPipelineTypeOptions[0]
      setSelectedPipelineType(initialSelectedOption.value)
    } else {
      setSelectedPipelineType(NO_OPTIONS[0].value)
    }
  }, [data])

  useEffect(() => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
  }, [])

  return (
    <div className={cx(styles.container)}>
      <EuiText className={styles.title}>Select a template</EuiText>
      <EuiSpacer size="s" />
      <EuiForm component="form">
        <EuiSpacer size="xs" />
        {(pipelineTypeOptions?.length > 1) && (
        <EuiFormRow className={styles.formRow}>
          <>
            <div className={styles.rowLabel}>Pipeline type</div>
            <EuiSuperSelect
              options={pipelineTypeOptions}
              valueOfSelected={selectedPipelineType}
              onChange={(value) => setSelectedPipelineType(value)}
              popoverClassName={styles.selectWrapper}
              data-testid="pipeline-type-select"
            />
          </>
        </EuiFormRow>
        )}
        {source === RdiPipelineTabs.Config && (
          <EuiFormRow className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>Database type</div>
              <EuiSuperSelect
                options={dbTypeOptions}
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
