import React, { useState } from 'react'
import {
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiTextColor,
  EuiToolTip,
  EuiButtonEmpty,
  PropertySort
} from '@elastic/eui'
import { isNull } from 'lodash'
import { useParams, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  formatBytes,
  formatLongName,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
  stringToBuffer
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { GroupBadge } from 'uiSrc/components'
import { setFilter, setSearchMatch, resetKeysData, fetchKeys, keysSelector } from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { setBrowserKeyListDataLoaded, setBrowserSelectedKey, resetBrowserTree, setBrowserTreeDelimiter } from 'uiSrc/slices/app/context'
import { Pages } from 'uiSrc/constants'
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
    dispatch(setBrowserTreeDelimiter(delimiter))
    dispatch(setFilter(null))
    dispatch(setSearchMatch(name))
    dispatch(resetKeysData())
    dispatch(fetchKeys(
      '0',
      viewType === KeyViewType.Browser ? SCAN_COUNT_DEFAULT : SCAN_TREE_COUNT_DEFAULT,
      () => dispatch(setBrowserKeyListDataLoaded(true)),
      () => dispatch(setBrowserKeyListDataLoaded(false)),
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
      className: 'dataType',
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
        const cellContent = name.substring(0, 200)
        return (
          <div data-testid="top-keys-table-name" className={cx(styles.delimiter, 'truncateText')}>
            <EuiToolTip
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
      render: (value: number) => {
        const [number, size] = formatBytes(value, 3, true)

        return (
          <EuiToolTip
            content={`${numberWithSpaces(value)} B`}
            data-testid="usedMemory-tooltip"
          >
            <>
              <span className={styles.count} data-testid={`nsp-usedMemory-value=${value}`}>
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
      render: (value: number, { name }) => {
        if (isNull(value)) {
          return (
            <EuiTextColor color="subdued" style={{ maxWidth: '100%' }} data-testid={`length-empty-${name}`}>
              -
            </EuiTextColor>
          )
        }
        return (
          <span className={styles.count} data-testid={`length-value-${name}`}>
            {numberWithSpaces(value)}
          </span>
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
