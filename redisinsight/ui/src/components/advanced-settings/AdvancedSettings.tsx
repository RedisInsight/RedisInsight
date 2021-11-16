import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiTitle
} from '@elastic/eui'

import { validateCountNumber } from 'uiSrc/utils'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { updateUserConfigSettingsAction, userSettingsSelector } from 'uiSrc/slices/user/user-settings'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import styles from './styles.module.scss'

const AdvancedSettings = () => {
  const [keysToScan, setKeysToScan] = useState<string | undefined>('')
  const [keysToScanInitial, setKeysToScanInitial] = useState<string | undefined>('')
  const [isKeysToScanEditing, setIsKeysToScanEditing] = useState<boolean>(false)
  const [isKeysToScanHovering, setIsKeysToScanHovering] = useState<boolean>(false)

  const { config } = useSelector(userSettingsSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    setKeysToScan(config?.scanThreshold.toString())
    setKeysToScanInitial(config?.scanThreshold.toString())
  }, [config])

  const handleApplyChanges = () => {
    setIsKeysToScanEditing(false)
    setIsKeysToScanHovering(false)

    // eslint-disable-next-line no-nested-ternary
    const data = keysToScan ? (+keysToScan < SCAN_COUNT_DEFAULT ? SCAN_COUNT_DEFAULT : +keysToScan) : null

    dispatch(
      updateUserConfigSettingsAction(
        { scanThreshold: data },
        () => {},
        () => setKeysToScan(keysToScanInitial)
      )
    )
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setKeysToScan(keysToScanInitial)
    setIsKeysToScanEditing(false)
    setIsKeysToScanHovering(false)
  }

  const onChange = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    isKeysToScanEditing && setKeysToScan(validateCountNumber(value))
  }

  const appendKeysToScanEditing = () =>
    (!isKeysToScanEditing ? <EuiIcon type="pencil" color="subdued" /> : '')

  return (
    <>
      <EuiSpacer size="s" />
      <EuiTitle size="xxs">
        <span>Filter by Key Type or Pattern</span>
      </EuiTitle>
      <EuiText size="s" color="subdued">
        Filtering by pattern per a large number of keys may decrease performance. Clear
        the control to restore the default value.
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="center" gutterSize="none" className={styles.keysToScanWrapper}>
        <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
          <EuiText size="xs" color="subdued" className={styles.inputLabel}>Keys to Scan:</EuiText>
        </EuiFlexItem>

        <EuiFlexItem
          onMouseEnter={() => setIsKeysToScanHovering(true)}
          onMouseLeave={() => setIsKeysToScanHovering(false)}
          onClick={() => setIsKeysToScanEditing(true)}
          grow={false}
          component="span"
          style={{ paddingBottom: '1px' }}
        >
          {isKeysToScanEditing || isKeysToScanHovering ? (
            <InlineItemEditor
              controlsPosition="right"
              viewChildrenMode={!isKeysToScanEditing}
              onApply={handleApplyChanges}
              onDecline={handleDeclineChanges}
              declineOnUnmount={false}
            >
              <EuiFieldNumber
                onChange={onChange}
                value={keysToScan}
                placeholder="10 000"
                name="keysToScan"
                aria-label="Filter by Key Name or Pattern"
                className={
                  cx(styles.keysToScanInput, { [styles.keysToScanInputEditing]: isKeysToScanEditing })
                }
                append={appendKeysToScanEditing()}
                fullWidth={false}
                compressed
                autoComplete="off"
                type="text"
                readOnly={!isKeysToScanEditing}
                data-testid="keys-to-scan-input"
              />
            </InlineItemEditor>
          ) : (
            <EuiText className={styles.keysToScanValue} data-testid="keys-to-scan-value">
              {keysToScan}
            </EuiText>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default AdvancedSettings
