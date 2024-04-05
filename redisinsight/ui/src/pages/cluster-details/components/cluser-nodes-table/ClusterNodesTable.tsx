import {
  EuiBasicTableColumn,
  EuiIcon,
  EuiInMemoryTable,
  EuiLoadingContent,
  EuiToolTip,
  PropertySort
} from '@elastic/eui'
import { IconType } from '@elastic/eui/src/components/icon/icon'
import cx from 'classnames'
import { map } from 'lodash'
import React, { useState } from 'react'
import {
  InputIconSvg,
  KeyIconSvg,
  MemoryIconSvg,
  OutputIconSvg,
  UserIconSvg,
  MeasureIconSvg
} from 'uiSrc/components/database-overview/components/icons'
import { ModifiedClusterNodes } from 'uiSrc/pages/clusterDetails/ClusterDetailsPage'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { rgb } from 'uiSrc/utils/colors'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import styles from './styles.module.scss'

const ClusterNodesTable = ({ nodes, loading }: { nodes: Nullable<ModifiedClusterNodes[]>, loading: boolean }) => {
  const [sort, setSort] = useState<PropertySort>({ field: 'host', direction: 'asc' })

  const isMaxValue = (field: string, value: number) => {
    const values = map(nodes, field)
    return Math.max(...values) === value && values.filter((v) => v === value).length === 1
  }

  const headerIconTemplate = (label: string, icon: IconType) => (
    <div className={cx(styles.headerCell, styles.headerCellIcon)}>
      <EuiIcon type={icon} className={styles.headerIcon} />
      <span>{label}</span>
    </div>
  )

  const columns: EuiBasicTableColumn<any>[] = [
    {
      name: (
        <div className={styles.headerCell}>
          <span>{`${nodes?.length} Primary nodes`}</span>
        </div>
      ),
      field: 'host',
      dataType: 'string',
      sortable: ({ index }) => index,
      render: (value: number, { letter, port, color }) => (
        <>
          <div
            className={styles.nodeColor}
            data-testid={`node-color-${letter}`}
            style={{ backgroundColor: rgb(color) }}
          />
          <div className={styles.hostPort}>
            <span className={styles.nodeName} data-testid="node-letter">{letter}</span>
            <span>{value}:{port}</span>
          </div>
        </>
      )
    },
    {
      name: headerIconTemplate('Commands/s', MeasureIconSvg),
      field: 'opsPerSecond',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const isMax = isMaxValue('opsPerSecond', value)
        return (
          <span className={cx({ [styles.maxValue]: isMax })} data-testid={`opsPerSecond-value${isMax ? '-max' : ''}`}>
            {numberWithSpaces(value)}
          </span>
        )
      }
    },
    {
      name: headerIconTemplate('Network Input', InputIconSvg),
      field: 'networkInKbps',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const isMax = isMaxValue('networkInKbps', value)
        return (
          <>
            <span className={cx({ [styles.maxValue]: isMax })} data-testid={`networkInKbps-value${isMax ? '-max' : ''}`}>
              {numberWithSpaces(value)}
            </span>
            <span className={styles.valueUnit}>kb/s</span>
          </>
        )
      }
    },
    {
      name: headerIconTemplate('Network Output', OutputIconSvg),
      field: 'networkOutKbps',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const isMax = isMaxValue('networkOutKbps', value)
        return (
          <>
            <span className={cx({ [styles.maxValue]: isMax })} data-testid={`networkOutKbps-value${isMax ? '-max' : ''}`}>
              {numberWithSpaces(value)}
            </span>
            <span className={styles.valueUnit}>kb/s</span>
          </>
        )
      }
    },
    {
      name: headerIconTemplate('Total Memory', MemoryIconSvg),
      field: 'usedMemory',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const [number, size] = formatBytes(value, 3, true)
        const isMax = isMaxValue('usedMemory', value)
        return (
          <EuiToolTip
            content={`${numberWithSpaces(value)} B`}
            data-testid="usedMemory-tooltip"
          >
            <>
              <span className={cx({ [styles.maxValue]: isMax })} data-testid={`usedMemory-value${isMax ? '-max' : ''}`}>
                {number}
              </span>
              <span className={styles.valueUnit}>{size}</span>
            </>
          </EuiToolTip>
        )
      }
    },
    {
      name: headerIconTemplate('Total Keys', KeyIconSvg),
      field: 'totalKeys',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const isMax = isMaxValue('totalKeys', value)
        return (
          <span className={cx({ [styles.maxValue]: isMax })} data-testid={`totalKeys-value${isMax ? '-max' : ''}`}>
            {numberWithSpaces(value)}
          </span>
        )
      }
    },
    {
      name: (
        <div className={cx(styles.headerCell, styles.headerCellIcon)}>
          <EuiIcon type={UserIconSvg} className={styles.headerIcon} />
          <span>Clients</span>
        </div>
      ),
      field: 'connectedClients',
      width: '12%',
      sortable: true,
      align: 'right',
      render: (value: number) => {
        const isMax = isMaxValue('connectedClients', value)
        return (
          <span className={cx({ [styles.maxValue]: isMax })} data-testid={`connectedClients-value${isMax ? '-max' : ''}`}>
            {numberWithSpaces(value)}
          </span>
        )
      }
    },
  ]

  return (
    <div className={styles.wrapper}>
      {(loading && !nodes) && (
        <div className={styles.loading} data-testid="primary-nodes-table-loading">
          <EuiLoadingContent lines={4} />
        </div>
      )}
      {nodes && (
        <div className={styles.tableWrapper}>
          <EuiInMemoryTable
            items={nodes ?? []}
            columns={columns}
            className={cx('inMemoryTableDefault', 'noHeaderBorders', 'stickyHeader', styles.table, styles.tableNodes)}
            responsive={false}
            sorting={{ sort }}
            onTableChange={({ sort }: any) => setSort(sort)}
            data-testid="primary-nodes-table"
          />
        </div>
      )}
    </div>
  )
}

export default ClusterNodesTable
