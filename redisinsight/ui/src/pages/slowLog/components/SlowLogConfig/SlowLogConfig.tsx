import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSuperSelect,
  EuiText,
} from '@elastic/eui'
import { toNumber } from 'lodash'
import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  DEFAULT_SLOWLOG_DURATION_UNIT,
  DEFAULT_SLOWLOG_MAX_LEN,
  DEFAULT_SLOWLOG_SLOWER_THAN,
  DurationUnits,
  DURATION_UNITS,
  MINUS_ONE,
} from 'uiSrc/constants'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { patchSlowLogConfigAction, slowLogConfigSelector, slowLogSelector } from 'uiSrc/slices/analytics/slowlog'
import { errorValidateNegativeInteger, validateNumber } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { convertNumberByUnits } from '../../utils'
import styles from './styles.module.scss'

export interface Props {
  closePopover: () => void
  onRefresh: (maxLen?: number) => void
}

const SlowLogConfig = ({ closePopover, onRefresh }: Props) => {
  const options = DURATION_UNITS
  const { instanceId } = useParams<{ instanceId: string }>()
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(slowLogSelector)
  const { slowLogDurationUnit } = useSelector(appContextDbConfig)
  const {
    slowlogMaxLen = DEFAULT_SLOWLOG_MAX_LEN,
    slowlogLogSlowerThan = DEFAULT_SLOWLOG_SLOWER_THAN,
  } = useSelector(slowLogConfigSelector)

  const [durationUnit, setDurationUnit] = useState(slowLogDurationUnit ?? DEFAULT_SLOWLOG_DURATION_UNIT)
  const [maxLen, setMaxLen] = useState(`${slowlogMaxLen}`)

  const [slowerThan, setSlowerThan] = useState(slowlogLogSlowerThan !== MINUS_ONE
    ? `${convertNumberByUnits(slowlogLogSlowerThan, durationUnit)}`
    : `${MINUS_ONE}`)

  const dispatch = useDispatch()

  const onChangeUnit = (value: DurationUnits) => {
    setDurationUnit(value)
  }

  const handleDefault = () => {
    setMaxLen(`${DEFAULT_SLOWLOG_MAX_LEN}`)
    setSlowerThan(`${DEFAULT_SLOWLOG_SLOWER_THAN}`)
    setDurationUnit(DEFAULT_SLOWLOG_DURATION_UNIT)
  }

  const handleCancel = () => {
    closePopover()
  }

  const calculateSlowlogLogSlowerThan = (initSlowerThan: string) => {
    if (initSlowerThan === '') {
      return DEFAULT_SLOWLOG_SLOWER_THAN
    }
    if (initSlowerThan === `${MINUS_ONE}`) {
      return MINUS_ONE
    }
    if (initSlowerThan === `${MINUS_ONE}`) {
      return MINUS_ONE
    }
    return durationUnit === DurationUnits.microSeconds ? +initSlowerThan : +initSlowerThan * 1000
  }

  const handleSave = () => {
    const slowlogLogSlowerThan = calculateSlowlogLogSlowerThan(slowerThan)
    dispatch(patchSlowLogConfigAction(
      instanceId,
      {
        slowlogMaxLen: maxLen ? toNumber(maxLen) : DEFAULT_SLOWLOG_MAX_LEN,
        slowlogLogSlowerThan,
      },
      durationUnit,
      onSuccess
    ))
  }

  const onSuccess = () => {
    onRefresh(maxLen ? toNumber(maxLen) : DEFAULT_SLOWLOG_MAX_LEN)
    closePopover()
  }

  const disabledApplyBtn = () => (errorValidateNegativeInteger(`${slowerThan}`) && !!slowerThan) || loading

  const clusterContent = () => (
    <>
      <EuiText color="subdued" className={styles.clusterText}>
        Each node can have different Slow Log configuration in a clustered database.
        <EuiSpacer size="s" />
        {'Use '}
        <code>CONFIG SET slowlog-log-slower-than</code>
        {' or '}
        <code>CONFIG SET slowlog-max-len</code>
        {' for a specific node in redis-cli to configure it.'}
      </EuiText>

      <EuiSpacer size="xs" />
      <EuiButton
        fill
        color="secondary"
        className={styles.clusterBtn}
        onClick={closePopover}
        data-testid="slowlog-config-ok-btn"
      >
        Ok
      </EuiButton>
    </>
  )

  const unitConverter = () => {
    if (Number.isNaN(toNumber(slowerThan))) {
      return `- ${DurationUnits.mSeconds}`
    }

    if (slowerThan === `${MINUS_ONE}`) {
      return `-1 ${DurationUnits.mSeconds}`
    }

    if (durationUnit === DurationUnits.microSeconds) {
      const value = numberWithSpaces(convertNumberByUnits(toNumber(slowerThan), DurationUnits.milliSeconds))
      return `${value} ${DurationUnits.mSeconds}`
    }

    if (durationUnit === DurationUnits.milliSeconds) {
      const value = numberWithSpaces(toNumber(slowerThan) * 1000)
      return `${value} ${DurationUnits.microSeconds}`
    }
    return null
  }

  return (
    <div className={cx(styles.container, { [styles.containerCluster]: connectionType === ConnectionType.Cluster })}>
      {connectionType === ConnectionType.Cluster && (clusterContent())}
      {connectionType !== ConnectionType.Cluster && (
      <>
        <EuiForm component="form">
          <EuiFormRow className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>slowlog-log-slower-than</div>
              <div className={styles.rowFields}>
                <EuiFieldText
                  name="slowerThan"
                  id="slowerThan"
                  className={styles.input}
                  value={slowerThan}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSlowerThan(validateNumber(e.target.value.trim(), -1, Infinity))
                  }}
                  placeholder={`${convertNumberByUnits(DEFAULT_SLOWLOG_SLOWER_THAN, durationUnit)}`}
                  autoComplete="off"
                  data-testid="slower-than-input"
                />
                <EuiSuperSelect
                  options={options}
                  valueOfSelected={durationUnit}
                  onChange={onChangeUnit}
                  popoverClassName={styles.selectWrapper}
                  data-test-subj="select-default-unit"
                />
                <div className={styles.helpText}>
                  <div data-testid="unit-converter">{unitConverter()}</div>
                  <div>
                    Execution time to exceed in order to log the command.
                    <br />
                    -1 disables Slow Log. 0 logs each command.
                  </div>
                </div>
              </div>
            </>
          </EuiFormRow>
          <EuiFormRow className={styles.formRow}>
            <>
              <div className={styles.rowLabel}>slowlog-max-len</div>
              <div className={styles.rowFields}>
                <EuiFieldText
                  name="maxLen"
                  id="maxLen"
                  className={styles.input}
                  placeholder={`${DEFAULT_SLOWLOG_MAX_LEN}`}
                  value={maxLen}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setMaxLen(validateNumber(e.target.value.trim())) }}
                  autoComplete="off"
                  data-testid="max-len-input"
                />
                <div className={styles.helpText}>
                  The length of the Slow Log. When a new command is logged the oldest
                  <br />
                  one is removed from the queue of logged commands.
                </div>
              </div>
            </>
          </EuiFormRow>
          <EuiSpacer size="m" />
        </EuiForm>

        <div className={styles.footer}>
          <div className={styles.helpText}>NOTE: This is server configuration</div>
          <div className={styles.actions}>
            <EuiButtonEmpty size="l" onClick={handleDefault} data-testid="slowlog-config-default-btn">
              Default
            </EuiButtonEmpty>
            <EuiButton color="secondary" onClick={handleCancel} data-testid="slowlog-config-cancel-btn">
              Cancel
            </EuiButton>
            <EuiButton
              fill
              color="secondary"
              isDisabled={disabledApplyBtn()}
              onClick={handleSave}
              data-testid="slowlog-config-save-btn"
            >
              Save
            </EuiButton>
          </div>
        </div>
      </>
      )}
    </div>
  )
}

export default SlowLogConfig
