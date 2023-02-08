import {
  EuiBasicTableColumn,
  EuiButtonEmpty,
  EuiInMemoryTable,
  EuiTextColor,
  EuiToolTip,
  PropertySort
} from '@elastic/eui'
import cx from 'classnames'
import { isNil } from 'lodash'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { GroupBadge } from 'uiSrc/components'
import { Pages } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserTreeDelimiter
} from 'uiSrc/slices/app/context'
import {
  changeSearchMode,
  fetchKeys,
  keysSelector,
  resetKeysData,
  setFilter,
  setSearchMatch
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'

import {
  formatBytes,
  formatLongName,
  HighlightType,
  isBigKey,
  stringToBuffer,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { Key } from 'apiSrc/modules/database-analysis/models/key'

import styles from './styles.module.scss'

export interface Props {
  data: Key[]
  defaultSortField: string
  delimiter?: string
  dataTestid?: string
}

const Table = (props: Props) => {
  const { data, defaultSortField, delimiter = ':', dataTestid = '' } = props
  const [sort, setSort] = useState<PropertySort>({ field: defaultSortField, direction: 'desc' })

  const history = useHistory()
  const dispatch = useDispatch()

  const { instanceId } = useParams<{ instanceId: string }>()

  const { viewType } = useSelector(keysSelector)

  const handleRedirect = (name: string) => {
    dispatch(changeSearchMode(SearchMode.Pattern))
    dispatch(setBrowserTreeDelimiter(delimiter))
    dispatch(setFilter(null))
    dispatch(setSearchMatch(name, SearchMode.Pattern))
    dispatch(resetKeysData(SearchMode.Pattern))
    dispatch(fetchKeys(
      {
        searchMode: SearchMode.Pattern,
        cursor: '0',
        count: viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      },
      () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true)),
      () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, false)),
    ))
    dispatch(resetBrowserTree())
    dispatch(setBrowserSelectedKey(stringToBuffer(name)))

    history.push(Pages.browser(instanceId))
  }

  const setDataTestId = ({ name }: { name: string }) => ({
    'data-testid': `row-${name}`
  })

  const columns: EuiBasicTableColumn<Key>[] = [
    {
      name: 'Key Type',
      field: 'type',
      width: '10%',
      align: 'left',
      sortable: true,
      render: (type: string) => (
        <div className={styles.badgesContainer}>
          <GroupBadge key={type} type={type} className={styles.badge} />
        </div>
      )
    },
    {
      name: 'Key Name',
      field: 'name',
      dataType: 'string',
      align: 'left',
      width: 'auto',
      height: '42px',
      sortable: true,
      truncateText: true,
      render: (name: string) => {
        const tooltipContent = formatLongName(name)
        const cellContent = (name as string).substring(0, 200)
        return (
          <div data-testid="top-keys-table-name" className={cx(styles.delimiter, 'truncateText')}>
            <EuiToolTip
              title="Key Name"
              anchorClassName={styles.tooltip}
              position="bottom"
              content={tooltipContent}
            >
              <EuiButtonEmpty
                className={styles.link}
                style={{ height: 'auto' }}
                onClick={() => handleRedirect(name)}
              >
                {cellContent}
              </EuiButtonEmpty>
            </EuiToolTip>
          </div>
        )
      }
    },
    {
      name: 'TTL',
      field: 'ttl',
      width: '14%',
      sortable: true,
      align: 'left',
      render: (value: number, { name }) => {
        if (isNil(value)) {
          return (
            <EuiTextColor color="subdued" style={{ maxWidth: '100%' }} data-testid={`ttl-empty-${value}`}>
              -
            </EuiTextColor>
          )
        }
        if (value === -1) {
          return (
            <EuiTextColor color="subdued" data-testid={`ttl-no-limit-${name}`}>
              No limit
            </EuiTextColor>
          )
        }

        return (
          <span className={styles.count} data-testid={`ttl-${name}`}>
            <EuiToolTip
              title="Time to Live"
              className={styles.tooltip}
              anchorClassName="truncateText"
              position="bottom"
              content={(
                <>
                  {`${truncateTTLToSeconds(value)} s`}
                  <br />
                  {`(${truncateNumberToDuration(value)})`}
                </>
              )}
            >
              <>{truncateNumberToFirstUnit(value)}</>
            </EuiToolTip>
          </span>
        )
      }
    },
    {
      name: 'Key Size',
      field: 'memory',
      width: '9%',
      sortable: true,
      align: 'right',
      render: (value: number, { type }) => {
        if (isNil(value)) {
          return (
            <EuiTextColor color="subdued" style={{ maxWidth: '100%' }} data-testid={`size-empty-${value}`}>
              -
            </EuiTextColor>
          )
        }
        const [number, size] = formatBytes(value, 3, true)
        const isHighlight = isBigKey(type, HighlightType.Memory, value)
        return (
          <EuiToolTip
            content={(
              <>
                {isHighlight ? (<>Consider splitting it into multiple keys<br /></>) : null}
                {numberWithSpaces(value)} B
              </>
            )}
            anchorClassName={cx({ [styles.highlight]: isHighlight })}
            data-testid="usedMemory-tooltip"
          >
            <>
              <span
                className={styles.count}
                data-testid={`nsp-usedMemory-value=${value}${isHighlight ? '-highlighted' : ''}`}
              >
                {number}
              </span>
              <span className={styles.valueUnit}>{size}</span>
            </>
          </EuiToolTip>
        )
      }
    },
    {
      name: 'Length',
      field: 'length',
      width: '15%',
      sortable: ({ length }) => length ?? -1,
      align: 'right',
      render: (value: number, { name, type }) => {
        if (isNil(value)) {
          return (
            <EuiTextColor color="subdued" style={{ maxWidth: '100%' }} data-testid={`length-empty-${name}`}>
              -
            </EuiTextColor>
          )
        }

        const isHighlight = isBigKey(type, HighlightType.Length, value)
        return (
          <EuiToolTip
            content={isHighlight ? 'Consider splitting it into multiple keys' : ''}
            anchorClassName={cx({ [styles.highlight]: isHighlight })}
            data-testid="usedMemory-tooltip"
          >
            <span className={styles.count} data-testid={`length-value-${name}${isHighlight ? '-highlighted' : ''}`}>
              {numberWithSpaces(value)}
            </span>
          </EuiToolTip>
        )
      }
    },
  ]

  return (
    <div className={styles.wrapper} data-testid={dataTestid}>
      <div className={styles.tableWrapper}>
        <EuiInMemoryTable
          items={data ?? []}
          columns={columns}
          className={cx('inMemoryTableDefault', 'noHeaderBorders', 'stickyHeader', styles.table)}
          responsive={false}
          itemId="name"
          rowProps={setDataTestId}
          sorting={{ sort }}
          onTableChange={({ sort }: any) => setSort(sort)}
          data-testid="nsp-table"
        />
      </div>
    </div>
  )
}

export default Table
