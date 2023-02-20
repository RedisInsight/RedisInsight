import {
  EuiHealth,
  EuiIcon,
  EuiOutsideClickDetector,
  EuiPopover,
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'
import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { fetchKeys, fetchSearchHistoryAction, keysSelector, setFilter } from 'uiSrc/slices/browser/keys'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import HelpTexts from 'uiSrc/constants/help-texts'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { FILTER_KEY_TYPE_OPTIONS } from './constants'

import styles from './styles.module.scss'

const FilterKeyType = () => {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<string>('')
  const [isVersionSupported, setIsVersionSupported] = useState<boolean>(true)
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)

  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { filter, viewType, searchMode } = useSelector(keysSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    setIsVersionSupported(
      isVersionHigherOrEquals(
        version,
        CommandsVersions.FILTER_PER_KEY_TYPES.since
      )
    )
  }, [version])

  useEffect(() => {
    setTypeSelected(filter ?? '')
  }, [filter])

  const options: EuiSuperSelectOption<string>[] = FILTER_KEY_TYPE_OPTIONS.map(
    (item) => {
      const { value, color, text } = item
      return {
        value,
        inputDisplay: (
          <>
            <EuiIcon
              type="controlsVertical"
              className={styles.controlsIcon}
              data-testid={`filter-option-type-selected-${value}`}
            />
          </>
        ),
        dropdownDisplay: <EuiHealth color={color} className={styles.dropdownDisplay}>{text}</EuiHealth>,
        'data-test-subj': `filter-option-type-${value}`,
      }
    }
  )

  options.push({
    value: 'clear',
    inputDisplay: null,
    dropdownDisplay: (
      <div className={styles.clearSelectionBtn} data-testid="clear-selection-btn">Clear Selection</div>
    )
  })

  const onChangeType = (initValue: string) => {
    const value = (initValue === 'clear') ? '' : typeSelected === initValue ? '' : initValue
    setTypeSelected(value)
    setIsSelectOpen(false)
    dispatch(setFilter(value || null))
    dispatch(
      fetchKeys(
        {
          searchMode,
          cursor: '0',
          count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
        },
        () => { dispatch(fetchSearchHistoryAction(searchMode)) }
      )
    )
  }

  const UnsupportedInfo = () => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={isInfoPopoverOpen}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip')}
      closePopover={() => setIsInfoPopoverOpen(false)}
      initialFocus={false}
      button={(
        <EuiIcon
          className={styles.infoIcon}
          type="iInCircle"
          color="subdued"
          onClick={() => setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)}
          style={{ cursor: 'pointer' }}
          data-testid="filter-info-popover-icon"
        />
      )}
    >
      <div className={styles.popover}>{HelpTexts.FILTER_UNSUPPORTED}</div>
    </EuiPopover>
  )

  return (
    <EuiOutsideClickDetector
      onOutsideClick={() => isVersionSupported && setIsSelectOpen(false)}
    >
      <div
        className={cx(
          styles.container,
          !isVersionSupported && styles.unsupported
        )}
      >
        {!typeSelected && (
          <div
            className={styles.allTypes}
            onClick={() => isVersionSupported && setIsSelectOpen(!isSelectOpen)}
            role="presentation"
          >
            <EuiIcon
              type="controlsVertical"
              data-testid="filter-option-type-default"
              className={cx(styles.controlsIcon, styles.allTypesIcon)}
            />
          </div>
        )}
        {!isVersionSupported && UnsupportedInfo()}
        <EuiSuperSelect
          fullWidth
          itemClassName={cx('withColorDefinition', styles.filterKeyType)}
          disabled={!isVersionSupported}
          options={options}
          isOpen={isSelectOpen}
          valueOfSelected={typeSelected}
          onChange={(value: string) => onChangeType(value)}
          data-testid="select-filter-key-type"
        />
      </div>
    </EuiOutsideClickDetector>
  )
}

export default FilterKeyType
