import { EuiFormRow, EuiLink, EuiSpacer, EuiSwitch, EuiTitle } from '@elastic/eui'
import { toNumber } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SettingItem } from 'uiSrc/components'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import styles from 'uiSrc/pages/settings/styles.module.scss'
import {
  setWorkbenchCleanUp,
  updateUserConfigSettingsAction, userSettingsConfigSelector,
  userSettingsWBSelector
} from 'uiSrc/slices/user/user-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { validateNumber } from 'uiSrc/utils'

const WorkbenchSettings = () => {
  const { cleanup } = useSelector(userSettingsWBSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useDispatch()

  const onSwitchWbCleanUp = (val: boolean) => {
    dispatch(setWorkbenchCleanUp(val))
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED,
      eventData: {
        currentValue: !val,
        newValue: val,
      }
    })
  }

  const handleApplyPipelineCountChanges = (value: string) => {
    dispatch(
      updateUserConfigSettingsAction(
        { batchSize: toNumber(value) },
      )
    )
  }

  return (
    <>
      <EuiTitle size="xs">
        <h4>Editor Cleanup</h4>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFormRow>
        <EuiSwitch
          label="Clear the Editor after running commands"
          checked={cleanup}
          onChange={(e) => onSwitchWbCleanUp(e.target.checked)}
          className={styles.switchOption}
          data-testid="switch-workbench-cleanup"
        />
      </EuiFormRow>
      <EuiSpacer size="xl" />
      <SettingItem
        initValue={batchSize.toString()}
        onApply={handleApplyPipelineCountChanges}
        validation={(value) => validateNumber(value)}
        title="Pipeline Mode"
        testid="pipeline-bunch"
        placeholder={`${PIPELINE_COUNT_DEFAULT}`}
        label="Commands in pipeline:"
        summary={(
          <>
            {'Sets the size of a command batch for the '}
            <EuiLink
              color="text"
              external={false}
              href="https://redis.io/docs/latest/develop/use/pipelining/"
              target="_blank"
              data-testid="pipelining-link"
            >
              pipeline
            </EuiLink>
            {' mode in Workbench. 0 or 1 pipelines every command.'}
          </>
        )}
      />
    </>
  )
}

export default WorkbenchSettings
