import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiText,
} from '@elastic/eui'
import { useParams } from 'react-router-dom'

import {
  setBulkActionType,
  selectedBulkActionsSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { BulkActionsType } from 'uiSrc/constants'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import BulkDelete from './BulkDelete'
import BulkActionsTabs from './BulkActionsTabs'
import BulkActionsInfo from './BulkActionsInfo'
import BulkDeleteSummary from './BulkDeleteSummary'
import styles from './styles.module.scss'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  handleBulkActionsPanel: (value: boolean) => void
  handleClosePanel: () => void
  onToggleFullScreen: () => void
}
const BulkActions = (props: Props) => {
  const { handleBulkActionsPanel } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { type } = useSelector(selectedBulkActionsSelector)
  const { filter, search } = useSelector(keysSelector)

  const [title, setTitle] = useState<string>('BULK ACTIONS')
  const [typeSelected, setTypeSelected] = useState<BulkActionsType>(type)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(!filter && !search)

  const dispatch = useDispatch()
  useEffect(() => {
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData: {
        databaseId: instanceId,
        filterType: filter,
        search,
      }
    })
  }, [])

  useEffect(() => {
    if (type === BulkActionsType.Delete) {
      setTitle('BULK ACTIONS: Delete Keys')
    }
  }, [type])

  useEffect(() => {
    setShowPlaceholder(!filter && !search)
  }, [filter, search])

  const handleChangeType = (value: BulkActionsType) => {
    setTypeSelected(value)
    dispatch(setBulkActionType(value))
  }

  const closePanel = () => {
    handleBulkActionsPanel(false)

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_CANCELLED,
      eventData: {
        databaseId: instanceId,
        filterType: filter,
        search,
        action: type
      }
    })
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        direction="column"
        className={cx(styles.container, 'relative')}
        gutterSize="none"
      >
        <EuiFlexItem grow style={{ marginBottom: '16px' }}>
          <EuiTitle size="xs" className={styles.title}>
            <h4>{title}</h4>
          </EuiTitle>
          <EuiToolTip
            content="Close"
            position="left"
            anchorClassName={styles.closePanelTooltip}
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              aria-label="Close panel"
              className={styles.closeBtn}
              onClick={() => closePanel()}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <div className="eui-yScroll">
          <div className={styles.contentActions} data-testid="bulk-actions-content">
            <BulkActionsTabs onChangeType={handleChangeType} />
            {!showPlaceholder && (
              <div data-testid="bulk-actions-summary">
                <BulkActionsInfo
                  filter={filter}
                  search={search || '*'}
                >
                  <>
                    {type === BulkActionsType.Delete && (
                      <BulkDeleteSummary />
                    )}
                  </>
                </BulkActionsInfo>

                {typeSelected === BulkActionsType.Delete && (
                  <BulkDelete onCancel={closePanel} />
                )}
              </div>
            )}
            {showPlaceholder && (
              <div className={styles.placeholder} data-testid="bulk-actions-placeholder">
                <EuiText color="subdued" className={styles.placeholderTitle}>No pattern or key type set</EuiText>
                <EuiText color="subdued" className={styles.placeholderSummary}>
                  To perform a bulk action, set the pattern or select the key type
                </EuiText>
              </div>
            )}
          </div>
        </div>
      </EuiFlexGroup>
    </div>
  )
}

export default BulkActions
