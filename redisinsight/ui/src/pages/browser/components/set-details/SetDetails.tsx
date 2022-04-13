import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiText,
  EuiToolTip,
} from '@elastic/eui'

import { formatLongName } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/keys'
import {
  deleteSetMembers,
  fetchSetMembers,
  fetchMoreSetMembers,
  setDataSelector,
  setSelector,
} from 'uiSrc/slices/set'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import { IColumnSearchState, ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import styles from './styles.module.scss'

const suffix = '_set'
const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const matchAllValue = '*'

export interface Props {
  isFooterOpen: boolean
}

const SetDetails = (props: Props) => {
  const { isFooterOpen } = props
  const [match, setMatch] = useState('*')
  const [deleting, setDeleting] = useState('')

  const { loading } = useSelector(setSelector)
  const { key = '', members, total, nextCursor } = useSelector(setDataSelector)
  const { length = 0 } = useSelector(selectedKeyDataSelector) ?? {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  const closePopover = () => {
    setDeleting('')
  }

  const showPopover = (member = '') => {
    setDeleting(`${member + suffix}`)
  }

  const handleDeleteMember = (member = '') => {
    dispatch(deleteSetMembers(key, [member]))
    closePopover()
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Set
      }
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'name')
    if (!fieldColumn) { return }

    const { value: match } = fieldColumn
    setMatch(match)
    dispatch(fetchSetMembers(key, 0, SCAN_COUNT_DEFAULT, match || matchAllValue))
  }

  const columns:ITableColumn[] = [
    {
      id: 'name',
      label: 'Member',
      isSearchable: true,
      staySearchAlwaysOpen: true,
      initialSearchValue: '',
      truncateText: true,
      render: function Name(_name: string, member: string) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = member.substring(0, 200)
        const tooltipContent = formatLongName(member)
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText'"
              data-testid={`set-member-value-${member}`}
            >
              <EuiToolTip
                title="Member"
                className={styles.tooltip}
                anchorClassName="truncateText"
                position="bottom"
                content={tooltipContent}
              >
                <>{cellContent}</>
              </EuiToolTip>
            </div>
          </EuiText>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      absoluteWidth: 20,
      headerClassName: 'hidden',
      render: function Actions(_act: any, cellData: string) {
        return (
          <div className="value-table-actions">
            <PopoverDelete
              item={cellData}
              keyName={key}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              handleDeleteItem={handleDeleteMember}
              handleButtonClick={handleRemoveIconClick}
              testid={`set-remove-btn-${cellData}`}
              appendInfo={length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT('Member') : null}
            />
          </div>
        )
      },
    },
  ]

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      dispatch(
        fetchMoreSetMembers(key, nextCursor, SCAN_COUNT_DEFAULT, match || matchAllValue)
      )
    }
  }

  return (
    <div
      className={
        cx(
          'key-details-table',
          'set-members-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )
      }
    >
      <VirtualTable
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        columns={columns}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={members}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onWheel={closePopover}
        onSearch={handleSearch}
      />
    </div>
  )
}

export default SetDetails
