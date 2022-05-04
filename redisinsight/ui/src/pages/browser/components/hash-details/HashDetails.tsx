import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  hashSelector,
  hashDataSelector,
  deleteHashFields,
  fetchHashFields,
  fetchMoreHashFields,
  updateHashValueStateSelector,
  updateHashFieldsAction,
} from 'uiSrc/slices/browser/hash'
import { formatLongName, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent, getMatchType } from 'uiSrc/telemetry'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  IColumnSearchState,
  ITableColumn,
} from 'uiSrc/components/virtual-table/interfaces'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import {
  GetHashFieldsResponse,
  AddFieldsToHashDto,
  HashFieldDto,
} from 'apiSrc/modules/browser/dto/hash.dto'
import { KeyTypes } from 'uiSrc/constants'
import PopoverDelete from '../popover-delete/PopoverDelete'

import styles from './styles.module.scss'

const suffix = '_hash'
const matchAllValue = '*'
const headerHeight = 60
const rowHeight = 43

interface IHashField extends HashFieldDto {
  editing: boolean;
}

export interface Props {
  isFooterOpen: boolean
}

const HashDetails = (props: Props) => {
  const { isFooterOpen } = props
  const dispatch = useDispatch()
  const [match, setMatch] = useState<Nullable<string>>(matchAllValue)
  const [deleting, setDeleting] = useState('')
  const [fields, setFields] = useState<IHashField[]>([])

  const { loading } = useSelector(hashSelector)
  const { loading: updateLoading } = useSelector(updateHashValueStateSelector)
  const {
    fields: loadedFields,
    total,
    nextCursor,
  } = useSelector(hashDataSelector)
  const { name: key, length } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  useEffect(() => {
    const hashFields: IHashField[] = loadedFields.map((item) => ({
      ...item,
      editing: false,
    }))
    setFields(hashFields)
  }, [loadedFields])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((field = '') => {
    setDeleting(`${field + suffix}`)
  }, [])

  const handleDeleteField = (field = '') => {
    dispatch(deleteHashFields(key, [field]))
    closePopover()
  }

  const handleEditField = (field = '', editing: boolean) => {
    const newFieldsState = fields.map((item) => {
      if (item.field === field) {
        return { ...item, editing }
      }
      return item
    })
    setFields(newFieldsState)
  }

  const handleApplyEditField = (field = '', value: string) => {
    const data: AddFieldsToHashDto = {
      keyName: key,
      fields: [
        {
          field,
          value,
        },
      ],
    }
    dispatch(updateHashFieldsAction(data, () => handleEditField(field, false)))
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
        keyType: KeyTypes.Hash
      }
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'field')
    if (fieldColumn) {
      const { value: match } = fieldColumn
      const onSuccess = (data: GetHashFieldsResponse) => {
        const matchValue = getMatchType(match)
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED
          ),
          eventData: {
            databaseId: instanceId,
            keyType: KeyTypes.Hash,
            match: matchValue,
            length: data.total,
          }
        })
      }
      setMatch(match)
      dispatch(fetchHashFields(key, 0, SCAN_COUNT_DEFAULT, match || matchAllValue, onSuccess))
    }
  }

  const columns: ITableColumn[] = [
    {
      id: 'field',
      label: 'Field',
      isSearchable: true,
      prependSearchName: 'Field:',
      initialSearchValue: '',
      truncateText: true,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Field(_name: string, { field }: HashFieldDto) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = field.substring(0, 200)
        const tooltipContent = formatLongName(field)
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'flex' }} className="truncateText" data-testid={`hash-field-${field}`}>
              <EuiToolTip
                title="Field"
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
      id: 'value',
      label: 'Value',
      truncateText: true,
      render: function Value(
        _name: string,
        { field, value, editing }: IHashField
      ) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = value.substring(0, 200)
        const tooltipContent = formatLongName(value)
        if (editing) {
          return (
            <InlineItemEditor
              initialValue={value}
              controlsPosition="right"
              placeholder="Enter Value"
              fieldName="fieldValue"
              expandable
              isLoading={updateLoading}
              onDecline={() => handleEditField(field, false)}
              onApply={(value) => handleApplyEditField(field, value)}
            />
          )
        }
        return (
          <EuiText color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`hash-field-value-${field}`}
            >
              <EuiToolTip
                title="Value"
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
      headerClassName: 'value-table-header-actions',
      className: 'actions',
      absoluteWidth: 100,
      render: function Actions(_act: any, { field }: HashFieldDto) {
        return (
          <div className="value-table-actions">
            <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit field"
              className="editFieldBtn"
              color="primary"
              disabled={updateLoading}
              onClick={() => handleEditField(field, true)}
              data-testid={`edit-hash-button-${field}`}
            />
            <PopoverDelete
              item={field}
              keyName={key}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={updateLoading}
              showPopover={showPopover}
              testid={`remove-hash-button-${field}`}
              handleDeleteItem={handleDeleteField}
              handleButtonClick={handleRemoveIconClick}
              appendInfo={length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT('Field') : null}
            />
          </div>
        )
      },
    },
  ]

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      dispatch(
        fetchMoreHashFields(
          key,
          nextCursor,
          SCAN_COUNT_DEFAULT,
          match || matchAllValue
        )
      )
    }
  }

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'hash-fields-container',
          styles.container,
          { footerOpened: isFooterOpen }
        )}
      >
        <VirtualTable
          keyName={key}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={fields}
          totalItemsCount={total}
          noItemsMessage={NoResultsFoundText}
          onWheel={closePopover}
          onSearch={handleSearch}
        />
      </div>
    </>
  )
}

export default HashDetails
