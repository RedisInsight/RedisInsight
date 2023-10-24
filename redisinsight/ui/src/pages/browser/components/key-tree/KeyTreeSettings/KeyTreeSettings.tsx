import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiButton, EuiButtonIcon, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPopover, EuiSuperSelect, EuiText } from '@elastic/eui'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { DEFAULT_DELIMITER, DEFAULT_TREE_SORTING, SortOrder } from 'uiSrc/constants'
import {
  appContextDbConfig,
  resetBrowserTree,
  setBrowserTreeDelimiter,
  setBrowserTreeSort,
} from 'uiSrc/slices/app/context'
import { ReactComponent as TreeViewSort } from 'uiSrc/assets/img/browser/treeViewSort.svg'

import styles from './styles.module.scss'

export interface Props {
  loading: boolean
}
const MAX_DELIMITER_LENGTH = 5
const sortOptions = [SortOrder.ASC, SortOrder.DESC].map((value) => ({
  value,
  inputDisplay: (
    <span data-testid={`tree-view-sorting-item-${value}`}>Key name {value}</span>
  ),
}))

const KeyTreeSettings = ({ loading }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { treeViewDelimiter = '', treeViewSort = DEFAULT_TREE_SORTING } = useSelector(appContextDbConfig)
  const [sorting, setSorting] = useState<SortOrder>(treeViewSort)
  const [delimiter, setDelimiter] = useState<string>(treeViewDelimiter)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setSorting(treeViewSort)
  }, [treeViewSort])

  useEffect(() => {
    setDelimiter(treeViewDelimiter)
  }, [treeViewDelimiter])

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  const closePopover = () => {
    setIsPopoverOpen(false)
    setTimeout(() => {
      resetStates()
    }, 500)
  }

  const resetStates = useCallback(() => {
    setSorting(treeViewSort)
    setDelimiter(treeViewDelimiter)
  }, [treeViewSort, treeViewDelimiter])

  const button = (
    <EuiButtonIcon
      iconType="indexSettings"
      onClick={onButtonClick}
      disabled={loading}
      className={cx(styles.anchorBtn)}
      aria-label="open tree view settings"
      data-testid="tree-view-settings-btn"
    />
  )

  const handleApply = () => {
    if (delimiter !== treeViewDelimiter) {
      dispatch(setBrowserTreeDelimiter(delimiter || DEFAULT_DELIMITER))
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
        eventData: {
          databaseId: instanceId,
          from: treeViewDelimiter,
          to: delimiter || DEFAULT_DELIMITER
        }
      })

      dispatch(resetBrowserTree())
    }

    if (sorting !== treeViewSort) {
      dispatch(setBrowserTreeSort(sorting))

      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
        eventData: {
          databaseId: instanceId,
          sorting: sorting || DEFAULT_TREE_SORTING,
        }
      })

      dispatch(resetBrowserTree())
    }

    setIsPopoverOpen(false)
  }

  const onChangeSort = (value: SortOrder) => {
    setSorting(value)
  }

  return (
    <div className={styles.container}>
      <EuiPopover
        ownFocus={false}
        anchorPosition="downLeft"
        isOpen={isPopoverOpen}
        anchorClassName={styles.anchorWrapper}
        panelClassName={styles.popoverWrapper}
        closePopover={closePopover}
        button={button}
      >
        <EuiFlexGroup gutterSize="s" direction="column">
          <EuiFlexItem className={styles.row}>
            <EuiText className={styles.title}>Filters</EuiText>
          </EuiFlexItem>
          <EuiFlexItem className={styles.row}>
            <div className={styles.label}>Delimiter</div>
            <EuiFieldText
              placeholder=":"
              value={delimiter}
              className={styles.input}
              onChange={(e) => setDelimiter(e.target.value)}
              aria-label="Title"
              maxLength={MAX_DELIMITER_LENGTH}
              data-testid="tree-view-delimiter-input"
            />
          </EuiFlexItem>
          <EuiFlexItem className={styles.row}>
            <div className={styles.label}>
              <EuiIcon type={TreeViewSort} className={styles.sortIcon} />
              Sort by
            </div>
            <EuiSuperSelect
              options={sortOptions}
              valueOfSelected={sorting}
              className={styles.select}
              itemClassName={styles.selectItem}
              onChange={(value: SortOrder) => onChangeSort(value)}
              data-testid="tree-view-sorting-select"
            />
          </EuiFlexItem>
          <EuiFlexItem className={styles.row}>
            <div className={styles.footer}>
              <EuiButton
                size="s"
                color="secondary"
                onClick={closePopover}
              >
                Cancel
              </EuiButton>
              <EuiButton
                fill
                size="s"
                color="secondary"
                data-testid="tree-view-apply-btn"
                onClick={handleApply}
              >
                Apply
              </EuiButton>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopover>
    </div>
  )
}

export default React.memo(KeyTreeSettings)
