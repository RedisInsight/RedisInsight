import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiLink } from '@elastic/eui'
import { toNumber } from 'lodash'

import { validateCountNumber, validateNumber } from 'uiSrc/utils'
import { SCAN_COUNT_DEFAULT, PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { updateUserConfigSettingsAction, userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'

import AdvancedSettingsItem from './AdvancedSettingsItem'

const AdvancedSettings = () => {
  const { scanThreshold = '', batchSize = PIPELINE_COUNT_DEFAULT } = useSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useDispatch()

  const handleApplyKeysToScanChanges = (value: string) => {
    // eslint-disable-next-line no-nested-ternary
    const data = value ? (+value < SCAN_COUNT_DEFAULT ? SCAN_COUNT_DEFAULT : +value) : null

    dispatch(
      updateUserConfigSettingsAction(
        { scanThreshold: data },
      )
    )
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
      <AdvancedSettingsItem
        initValue={scanThreshold.toString()}
        onApply={handleApplyKeysToScanChanges}
        validation={validateCountNumber}
        title="Keys to Scan in Browser"
        summary="Sets the amount of keys to scan per one iteration. Filtering by pattern per a large number of keys may decrease performance."
        testid="keys-to-scan"
        placeholder="10 000"
        label="Keys to Scan:"
      />
      <AdvancedSettingsItem
        initValue={batchSize.toString()}
        onApply={handleApplyPipelineCountChanges}
        validation={(value) => validateNumber(value)}
        title="Pipeline mode"
        testid="pipeline-bunch"
        placeholder={`${PIPELINE_COUNT_DEFAULT}`}
        label="Commands in pipeline:"
        summary={(
          <>
            {`Sets the size of a command batch for the pipeline mode.
              0 or 1 would pipeline every command. Learn more about `}
            <EuiLink
              color="text"
              external={false}
              href="https://redis.io/docs/manual/pipelining/"
              target="_blank"
              data-testid="pipelining-link"
            >
              pipelining.
            </EuiLink>
          </>
        )}
      />
    </>
  )
}

export default AdvancedSettings
