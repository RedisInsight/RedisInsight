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
import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  DEFAULT_SLOWLOG_DURATION_UNIT,
  DEFAULT_SLOWLOG_MAX_LEN,
  DEFAULT_SLOWLOG_SLOWER_THAN,
  DurationUnits,
  DURATION_UNITS,
  Pages
} from 'uiSrc/constants'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { setDBConfigStorageField } from 'uiSrc/services'
import { patchSlowLogConfigAction, slowLogConfigSelector, slowLogSelector } from 'uiSrc/slices/slowlog/slowlog'
import { validateNumber } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { openCli } from 'uiSrc/slices/cli/cli-settings'
import styles from './styles.module.scss'
import { convertNumberByUnits } from '../../utils'

export interface Props {
  closePopover: () => void
  onRefresh: () => void
}

const SlowLogConfig = ({ closePopover, onRefresh }: Props) => {
  const options = DURATION_UNITS
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { loading, durationUnit: durationUnitStore } = useSelector(slowLogSelector)
  const {
    slowlogMaxLen = DEFAULT_SLOWLOG_MAX_LEN,
    slowlogLogSlowerThan = DEFAULT_SLOWLOG_SLOWER_THAN,
  } = useSelector(slowLogConfigSelector)

  const [maxLen, setMaxLen] = useState(`${slowlogMaxLen}`)
  const [slowerThan, setSlowerThan] = useState(validateNumber(`${slowlogLogSlowerThan}`, Infinity, -1))
  const [durationUnit, setDurationUnit] = useState(durationUnitStore ?? DEFAULT_SLOWLOG_DURATION_UNIT)

  const dispatch = useDispatch()

  const onChangeUnit = (value: DurationUnits) => {
    setDurationUnit(value)
  }

  const handleDefault = () => {
    setMaxLen(`${slowlogMaxLen}`)
    setSlowerThan(`${slowlogLogSlowerThan}`)
    setDurationUnit(durationUnitStore ?? DEFAULT_SLOWLOG_DURATION_UNIT)
  }

  const handleCancel = () => {
    closePopover()
  }

  const handleSave = () => {
    dispatch(patchSlowLogConfigAction(
      instanceId,
      {
        slowlogMaxLen: +maxLen,
        slowlogLogSlowerThan: convertNumberByUnits(+slowerThan || -1, durationUnit)
      },
      durationUnit,
      onSuccess
    ))
  }

  const onSuccess = () => {
    setDBConfigStorageField(instanceId, ConfigDBStorageItem.slowLogDurationUnit, durationUnit)

    onRefresh()
    closePopover()
  }

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(instanceId))
  }
  const handleOpenCli = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(openCli())
  }

  const clusterContent = () => (
    <>
      <EuiText color="subdued" className={styles.clusterText}>
        {'Each node can have different Slow Log configuration in a clustered database. Use '}
        <a
          tabIndex={0}
          onClick={handleOpenCli}
          className={styles.link}
          data-testid="internal-cli-link"
          onKeyDown={() => ({})}
          role="link"
          rel="noreferrer"
        >
          CLI
        </a>
        {' or '}
        <a
          tabIndex={0}
          onClick={handleGoWorkbenchPage}
          className={styles.link}
          data-testid="internal-workbench-link"
          onKeyDown={() => ({})}
          role="link"
          rel="noreferrer"
        >
          Workbench
        </a>
        {' to configure it.'}
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

  return (
    <div className={cx(styles.container, { [styles.containerCluster]: connectionType === ConnectionType.Cluster })}>
      { connectionType === ConnectionType.Cluster && (clusterContent())}
      { connectionType !== ConnectionType.Cluster && (
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
                  placeholder={`${slowlogLogSlowerThan}`}
                  value={slowerThan}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSlowerThan(validateNumber(e.target.value.trim(), Infinity, -1))
                  }}
                  isLoading={loading}
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
                  <div>10 ms</div>
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
                  placeholder={`${slowlogMaxLen}`}
                  value={maxLen}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setMaxLen(validateNumber(e.target.value.trim())) }}
                  isLoading={loading}
                  autoComplete="off"
                  data-testid="max-len-input"
                />
                <div className={styles.helpText}>
                  The length of the Slow Log.When a new command is logged the oldest
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
            <EuiButton fill color="secondary" onClick={handleSave} data-testid="slowlog-config-save-btn">
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
