import React, { Fragment, useState } from 'react'
import {
  EuiBasicTableColumn,
  EuiInMemoryTable,
  EuiLoadingContent,
  EuiToolTip,
  EuiButtonIcon,
  EuiText,
  PropertySort
} from '@elastic/eui'
import { useParams, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { ModifiedClusterNodes } from 'uiSrc/pages/clusterDetails/ClusterDetailsPage'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { GroupBadge } from 'uiSrc/components'
import { Pages } from 'uiSrc/constants'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { changeKeyViewType, setFilter, setSearchMatch } from 'uiSrc/slices/browser/keys'
import { setBrowserTreeDelimiter } from 'uiSrc/slices/app/context'

import styles from './styles.module.scss'

const NameSpacesTable = ({ data, loading }: { data: Nullable<ModifiedClusterNodes[]>, loading: boolean }) => {
  const [sort, setSort] = useState<PropertySort>({ field: 'keyPattern', direction: 'asc' })
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState({})

  const history = useHistory()
  const dispatch = useDispatch()

  const { instanceId } = useParams<{ instanceId: string }>()

  const handleRedirect = (nsp: string, filter: string) => {
    // dispatch(changeKeyViewType(KeyViewType.Tree))
    dispatch(setBrowserTreeDelimiter(nsp))
    dispatch(setFilter(filter))
    dispatch(setSearchMatch(''))
    history.push(Pages.browser(instanceId))
  }

  const toggleDetails = item => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap }
    if (itemIdToExpandedRowMapValues[item.nsp]) {
      delete itemIdToExpandedRowMapValues[item.nsp]
    } else {
      itemIdToExpandedRowMapValues[item.nsp] = (
        <div style={{ width: '100%' }}>
          {item.types.map((type) => {
            const [number, size] = formatBytes(type.memory, 3, true)
            return (
              <div className={styles.expanded} key={type.type}>
                <div style={{ paddingLeft: '12px' }} onClick={() => handleRedirect(item.nsp, type.type)}>{`${item.nsp}:*`}</div>
                <div><GroupBadge type={type.type} /></div>
                <div className={styles.rightAlign}>
                  <span data-testid="usedMemory-value">
                    {number}
                  </span>
                  <span className={styles.valueUnit}>{size}</span>
                </div>
                <div className={styles.rightAlign}>{type.keys}</div>
                <div />
              </div>
            )
          })}
        </div>
      )
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues)
  }

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: 'Key Pattern',
      field: 'nsp',
      dataType: 'string',
      align: 'left',
      sortable: ({ index }) => index,
      render: (nsp: string, { types }: { types: any[] }) => {
        const filterType = types.length > 1 ? '' : types[0].type
        return (
          <div className={styles.hostPort}>
            <span onClick={() => handleRedirect(nsp, filterType)}>{`${nsp}:*`}</span>
          </div>
        )
      }
    },
    {
      name: 'Data Type',
      field: 'types',
      width: '34%',
      sortable: true,
      align: 'left',
      render: (value: any[]) => (
        <>{value.map(({ type }) => <GroupBadge key={type} type={type} className={styles.badge} />)}</>
      )
    },
    {
      name: 'Total Memory',
      field: 'memory',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const [number, size] = formatBytes(value, 3, true)

        return (
          <>
            <span data-testid="usedMemory-value">
              {number}
            </span>
            <span className={styles.valueUnit}>{size}</span>
          </>
        )
      }
    },
    {
      name: 'Total Keys',
      field: 'keys',
      width: '10%',
      sortable: true,
      align: 'right',
      render: (value: number) => (
        <span data-testid={`networkInKbps-value-${value}`}>
          {numberWithSpaces(value)}
        </span>
      )
    },
    {
      name: '',
      width: '20px',
      isExpander: true,
      render: item => (
        <>
          {item.types.length > 1 && (
            <EuiButtonIcon
              style={{ marginRight: '6px' }}
              onClick={() => toggleDetails(item)}
              aria-label={itemIdToExpandedRowMap[item.nsp] ? 'Collapse' : 'Expand'}
              iconType={itemIdToExpandedRowMap[item.nsp] ? 'arrowUp' : 'arrowDown'}
            />
          )}
        </>
      ),
    },
  ]

  return (
    <div className={styles.wrapper}>
      {(loading && !data) && (
        <div className={styles.loading} data-testid="primary-nodes-table-loading">
          <EuiLoadingContent lines={4} />
        </div>
      )}
      {data && (
        <div className={styles.tableWrapper}>
          <EuiInMemoryTable
            items={data ?? []}
            columns={columns}
            className={cx('inMemoryTableDefault', 'noHeaderBorders', 'stickyHeader', styles.table, styles.tableNodes)}
            responsive={false}
            itemId="nsp"
            itemIdToExpandedRowMap={itemIdToExpandedRowMap}
            isExpandable
            sorting={{ sort }}
            onTableChange={({ sort }: any) => setSort(sort)}
            data-testid="primary-nodes-table"
          />
        </div>
      )}
    </div>
  )
}

export default NameSpacesTable
